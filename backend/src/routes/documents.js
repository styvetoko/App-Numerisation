import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification (à importer depuis auth.js si besoin)
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès réservé à l\'admin' });
  next();
};

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /documents : upload d'un document
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });
    const doc = await prisma.document.create({
      data: {
        title,
        description,
        category,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedBy: { connect: { id: req.user.id } },
      }
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// GET /documents : liste des documents
router.get('/', auth, async (req, res) => {
  try {
    let docs;
    if (req.user.role === 'ADMIN') {
      docs = await prisma.document.findMany({ include: { uploadedBy: true }, orderBy: { createdAt: 'desc' } });
    } else {
      docs = await prisma.document.findMany({ where: { uploadedById: req.user.id }, include: { uploadedBy: true }, orderBy: { createdAt: 'desc' } });
    }
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET /documents/:id : détail d'un document
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: Number(req.params.id) }, include: { uploadedBy: true } });
    if (!doc) return res.status(404).json({ error: 'Document non trouvé' });
    if (req.user.role !== 'ADMIN' && doc.uploadedById !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /documents/:id : suppression
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!doc) return res.status(404).json({ error: 'Document non trouvé' });
    if (req.user.role !== 'ADMIN' && doc.uploadedById !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });
    // Supprimer le fichier physique
    const filePath = path.resolve('uploads', path.basename(doc.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.document.delete({ where: { id: doc.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;
