// F:\portfolio-webapp\backend\routes\import.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = (supabase) => {

  // ============ IMPORT FROM FACEBOOK/YOUTUBE ============
  router.post('/video', async (req, res) => {
    try {
      const { url, title, description, category, project_id } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      // Validate URL (Facebook or YouTube)
      const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      if (!isFacebook && !isYouTube) {
        return res.status(400).json({ 
          error: 'Only Facebook and YouTube URLs are supported' 
        });
      }

      // Create temp directory (for downloading and processing)
      const tempDir = path.join(__dirname, '../uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const outputFilename = `imported_${timestamp}.mp4`;
      const outputPath = path.join(tempDir, outputFilename);

      // -------------------------------------------------------------
      // Step 1: Download video using yt-dlp (prefer mp4 to avoid merge)
      console.log(`📥 Downloading video from: ${url}`);
      // Use format that gives a single mp4 file (no need for ffmpeg merge)
      const downloadCommand = `yt-dlp -f "best[ext=mp4]" -o "${outputPath}" "${url}"`;
      await execPromise(downloadCommand);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Download failed - no file created');
      }

      // Step 2: Check file size and compress if needed (optional)
      const stats = fs.statSync(outputPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      console.log(`📊 File size: ${fileSizeMB.toFixed(2)} MB`);

      let finalLocalPath = outputPath;
      
      if (fileSizeMB > 100) {
        console.log('📦 File > 100MB, compressing...');
        const compressedFilename = `compressed_${timestamp}.mp4`;
        const compressedPath = path.join(tempDir, compressedFilename);
        
        // FFmpeg compression – requires ffmpeg installed on Render
        const compressCommand = `ffmpeg -i "${outputPath}" -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k "${compressedPath}" -y`;
        await execPromise(compressCommand);
        
        // Delete original large file
        fs.unlinkSync(outputPath);
        finalLocalPath = compressedPath;
        
        const newStats = fs.statSync(finalLocalPath);
        const newSizeMB = newStats.size / (1024 * 1024);
        console.log(`✅ Compressed to: ${newSizeMB.toFixed(2)} MB`);
      }

      // -------------------------------------------------------------
      // Step 3: Upload to Supabase Storage instead of local filesystem
      const fileBuffer = fs.readFileSync(finalLocalPath);
      const fileExt = path.extname(finalLocalPath);
      const storageFileName = `video_${timestamp}${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storageFileName, fileBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        });

      // Clean up local temp file (even if upload fails)
      if (fs.existsSync(finalLocalPath)) {
        fs.unlinkSync(finalLocalPath);
      }
      // Also delete any leftover outputPath if different
      if (outputPath !== finalLocalPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload video to storage' });
      }

      // Step 4: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(storageFileName);
      const publicUrl = publicUrlData.publicUrl;

      // Step 5: Save to database with the public URL
      const videoData = {
        title: title || 'Imported Video',
        description: description || '',
        project_id: project_id || null,
        filename: storageFileName,        // for future deletion
        path: publicUrl,                  // store full public URL
        category: category || 'demo',
        views: 0
      };

      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (dbError) {
        // Rollback: delete the uploaded file from Supabase
        await supabase.storage.from('videos').remove([storageFileName]);
        console.error('Database insert error, rolled back storage:', dbError);
        return res.status(500).json({ error: 'Database error, video not saved' });
      }

      console.log('✅ Video imported and stored in Supabase successfully!');
      res.json({
        success: true,
        message: 'Video imported successfully!',
        video: video
      });

    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ 
        error: 'Failed to import video', 
        details: error.message 
      });
    }
  });

  return router;
};
