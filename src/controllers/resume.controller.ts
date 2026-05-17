import { Request, Response, NextFunction } from 'express';
import { analyzeResume } from '../services/resume.service';
import { supabase } from '../lib/supabase';

async function upload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No CV file uploaded' });
      return;
    }

    const jdText = (req.body.jdText as string) ?? '';
    const targetRole = (req.body.targetRole as string) ?? '';

    const { analysis, cvId } = await analyzeResume(
      req.file.buffer,
      req.file.mimetype,
      jdText,
      targetRole,
      req.user.id
    );

    res.json({ success: true, analysis, cvId });
  } catch (err) {
    next(err);
  }
}

async function analyse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cvId, jdText, targetRole } = req.body as {
      cvId: string;
      jdText: string;
      targetRole: string;
    };

    const { data: cvRecord, error } = await supabase
      .from('cv_versions')
      .select('cv_text, storage_path')
      .eq('id', cvId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !cvRecord) {
      res.status(404).json({ success: false, error: 'CV not found' });
      return;
    }

    const cvText = cvRecord.cv_text as string;

    const fakeBuffer = Buffer.from(cvText, 'utf-8');
    const { analysis } = await analyzeResume(
      fakeBuffer,
      'text/plain',
      jdText,
      targetRole,
      req.user.id
    );

    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
}

async function download(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cvId = req.params.id;

    const { data: cvRecord, error } = await supabase
      .from('cv_versions')
      .select('storage_path')
      .eq('id', cvId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !cvRecord) {
      res.status(404).json({ success: false, error: 'CV not found' });
      return;
    }

    const storagePath = cvRecord.storage_path as string;

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(storagePath);

    if (downloadError || !fileData) {
      res.status(404).json({ success: false, error: 'File not found in storage' });
      return;
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Disposition', 'attachment; filename="careerai_cv.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export { upload, analyse, download };
