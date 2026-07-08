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

      // Create temp directory
      const tempDir = path.join(__dirname, '../uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const outputFilename = `imported_${timestamp}.mp4`;
      const outputPath = path.join(tempDir, outputFilename);

      // Step 1: Download video using yt-dlp
      console.log(`📥 Downloading video from: ${url}`);
      
      const downloadCommand = `yt-dlp -f "best[ext=mp4]" -o "${outputPath}" "${url}"`;
      await execPromise(downloadCommand);

      // Check if file was downloaded
      if (!fs.existsSync(outputPath)) {
        throw new Error('Download failed - no file created');
      }

      // Step 2: Check file size and compress if needed
      const stats = fs.statSync(outputPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      console.log(`📊 File size: ${fileSizeMB.toFixed(2)} MB`);

      let finalPath = outputPath;
      
      if (fileSizeMB > 100) {
        console.log('📦 File > 100MB, compressing...');
        const compressedFilename = `compressed_${timestamp}.mp4`;
        const compressedPath = path.join(tempDir, compressedFilename);
        
        const compressCommand = `ffmpeg -i "${outputPath}" -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k "${compressedPath}" -y`;
        await execPromise(compressCommand);
        
        // Delete original large file
        fs.unlinkSync(outputPath);
        finalPath = compressedPath;
        
        const newStats = fs.statSync(finalPath);
        const newSizeMB = newStats.size / (1024 * 1024);
        console.log(`✅ Compressed to: ${newSizeMB.toFixed(2)} MB`);
      }

      // Step 3: Move to permanent uploads folder
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const finalFilename = `video_${timestamp}.mp4`;
      const finalPathFinal = path.join(uploadsDir, finalFilename);
      fs.renameSync(finalPath, finalPathFinal);

      // Step 4: Save to database
      const videoData = {
        title: title || 'Imported Video',
        description: description || '',
        project_id: project_id || null,
        filename: finalFilename,
        path: `/uploads/${finalFilename}`,
        category: category || 'demo',
        views: 0
      };

      const { data: video, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) {
        // Clean up file if database insert fails
        if (fs.existsSync(finalPathFinal)) {
          fs.unlinkSync(finalPathFinal);
        }
        throw error;
      }

      console.log('✅ Video imported successfully!');

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
