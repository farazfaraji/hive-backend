import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { LanguageArticleService } from 'src/services/courses/language/language-article.service';
import * as fs from 'fs';
import { NotFoundException } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('v1/lesson/article')
export class LanguageArticleController {
  constructor(private readonly service: LanguageArticleService) {}

  @Get('/play/:audioId')
  async streamAudio(@Param('audioId') audioId: string, @Res() res: Response) {
    const audioPath = await this.service.play(audioId);

    console.log(audioPath);

    if (!audioPath) {
      throw new NotFoundException('Audio file not found');
    }

    if (!fs.existsSync(audioPath)) {
      throw new NotFoundException('Audio file not found on server');
    }

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(audioPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(audioPath).pipe(res);
    }
  }
}
