const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Review = require('../models/Review');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - therapistId
 *         - patientId
 *         - rating
 *       properties:
 *         reviewId:
 *           type: string
 *         therapistId:
 *           type: string
 *         patientId:
 *           type: string
 *         appointmentId:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         categories:
 *           type: object
 *           properties:
 *             professionalism:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             communication:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             effectiveness:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             empathy:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *         comment:
 *           type: string
 *         isAnonymous:
 *           type: boolean
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const reviewId = crypto.randomBytes(16).toString('hex');
    const reviewData = {
      ...req.body,
      reviewId,
    };

    const newReview = new Review(reviewData);
    await newReview.save();

    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/therapist/{therapistId}:
 *   get:
 *     summary: Get all reviews for a therapist
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVisible
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.get('/therapist/:therapistId', async (req, res) => {
  try {
    const filter = { therapistId: req.params.therapistId };
    
    if (req.query.isVisible !== undefined) {
      filter.isVisible = req.query.isVisible === 'true';
    }
    if (req.query.minRating) {
      filter.rating = { $gte: parseInt(req.query.minRating) };
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this therapist' });
    }

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/therapist/{therapistId}/stats:
 *   get:
 *     summary: Get review statistics for a therapist
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review statistics
 *       404:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.get('/therapist/:therapistId/stats', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      therapistId: req.params.therapistId,
      isVisible: true 
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this therapist' });
    }

    const stats = {
      totalReviews: reviews.length,
      averageRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2),
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
      categoryAverages: {
        professionalism: (reviews.filter(r => r.categories?.professionalism).reduce((sum, r) => sum + r.categories.professionalism, 0) / reviews.filter(r => r.categories?.professionalism).length).toFixed(2),
        communication: (reviews.filter(r => r.categories?.communication).reduce((sum, r) => sum + r.categories.communication, 0) / reviews.filter(r => r.categories?.communication).length).toFixed(2),
        effectiveness: (reviews.filter(r => r.categories?.effectiveness).reduce((sum, r) => sum + r.categories.effectiveness, 0) / reviews.filter(r => r.categories?.effectiveness).length).toFixed(2),
        empathy: (reviews.filter(r => r.categories?.empathy).reduce((sum, r) => sum + r.categories.empathy, 0) / reviews.filter(r => r.categories?.empathy).length).toFixed(2),
      },
      verifiedReviews: reviews.filter(r => r.isVerified).length,
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving review statistics', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/patient/{patientId}:
 *   get:
 *     summary: Get all reviews by a patient
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const reviews = await Review.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this patient' });
    }

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review data
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({ reviewId: req.params.id });

    if (!review) {
      return res.status(404).json({ message: `Review with ID ${req.params.id} not found` });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving review', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { reviewId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: `Review with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/{id}/respond:
 *   patch:
 *     summary: Add therapist response to review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response added successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/respond', async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { reviewId: req.params.id },
      { 
        response: {
          content: req.body.content,
          respondedAt: new Date()
        }
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: `Review with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Response added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error adding response', error: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ reviewId: req.params.id });

    if (!review) {
      return res.status(404).json({ message: `Review with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Review deleted successfully', reviewId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;

