// lib/data/products.ts
// Seed data — imported ONLY by app/api/products/route.ts.
// Nothing in components or the store imports this directly.
// When a real database arrives, only the Route Handler changes.

import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    stepIndex: 1,
    products: [
      {
        id: 'cam-outdoor-pro',
        name: 'Outdoor Camera Pro',
        description: '1080p HD, color night vision, weatherproof',
        image: '/images/cam-outdoor-pro.png',
        badge: 'Save 22%',
        compareAtPrice: 199,
        price: 155,
        learnMoreUrl: '#',
        variants: [
          { id: 'cam-outdoor-pro-white', label: 'White', color: '#FFFFFF' },
          { id: 'cam-outdoor-pro-black', label: 'Black', color: '#1F2937' },
        ],
      },
      {
        id: 'cam-indoor',
        name: 'Indoor Camera',
        description: '1080p HD, two-way audio, motion alerts',
        image: '/images/cam-indoor.png',
        badge: 'Save 18%',
        compareAtPrice: 149,
        price: 122,
        learnMoreUrl: '#',
        variants: [
          { id: 'cam-indoor-white', label: 'White', color: '#FFFFFF' },
          { id: 'cam-indoor-black', label: 'Black', color: '#1F2937' },
        ],
      },
      {
        id: 'cam-doorbell',
        name: 'Video Doorbell',
        description: 'HD video, motion detection, night vision',
        image: '/images/cam-doorbell.png',
        compareAtPrice: 179,
        price: 149,
        learnMoreUrl: '#',
        // No variants — single stepper
      },
      {
        id: 'cam-floodlight',
        name: 'Floodlight Camera',
        description: '2K resolution, 2000-lumen LED, built-in siren',
        image: '/images/cam-floodlight.png',
        badge: 'Save 15%',
        compareAtPrice: 249,
        price: 212,
        learnMoreUrl: '#',
        variants: [
          { id: 'cam-floodlight-white', label: 'White', color: '#FFFFFF' },
          { id: 'cam-floodlight-black', label: 'Black', color: '#1F2937' },
        ],
      },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    stepIndex: 2,
    products: [
      {
        id: 'plan-basic',
        name: 'Basic Plan',
        description: 'Live view, motion alerts, 7-day cloud storage',
        image: '/images/plan-basic.png',
        price: 0,
        learnMoreUrl: '#',
      },
      {
        id: 'plan-standard',
        name: 'Standard Plan',
        description: '30-day cloud storage, professional monitoring',
        image: '/images/plan-standard.png',
        badge: 'Most popular',
        compareAtPrice: 19.99,
        price: 14.99,
        learnMoreUrl: '#',
      },
      {
        id: 'plan-premium',
        name: 'Premium Plan',
        description: '60-day storage, 24/7 monitoring, priority support',
        image: '/images/plan-premium.png',
        compareAtPrice: 29.99,
        price: 24.99,
        learnMoreUrl: '#',
      },
    ],
  },
  {
    id: 'sensors',
    label: 'Sensors',
    stepIndex: 3,
    products: [
      {
        id: 'sensor-door',
        name: 'Door & Window Sensor',
        description: 'Instant alerts when opened or closed',
        image: '/images/sensor-door.png',
        badge: 'Save 20%',
        compareAtPrice: 29,
        price: 23,
        learnMoreUrl: '#',
      },
      {
        id: 'sensor-motion',
        name: 'Motion Sensor',
        description: 'Pet-immune PIR, 30-foot range',
        image: '/images/sensor-motion.png',
        badge: 'Save 17%',
        compareAtPrice: 35,
        price: 29,
        learnMoreUrl: '#',
      },
      {
        id: 'sensor-glass',
        name: 'Glass Break Sensor',
        description: 'Detects glass breaking within 25 feet',
        image: '/images/sensor-glass.png',
        compareAtPrice: 45,
        price: 39,
        learnMoreUrl: '#',
      },
      {
        id: 'sensor-smoke',
        name: 'Smoke & CO Detector',
        description: 'Dual-sensor, interconnected alerts',
        image: '/images/sensor-smoke.png',
        compareAtPrice: 59,
        price: 49,
        learnMoreUrl: '#',
      },
    ],
  },
  {
    id: 'extras',
    label: 'Add Extra Protection',
    stepIndex: 4,
    products: [
      {
        id: 'extra-keypad',
        name: 'Keypad',
        description: 'Backlit, arm/disarm with PIN or fingerprint',
        image: '/images/extra-keypad.png',
        badge: 'Save 10%',
        compareAtPrice: 69,
        price: 62,
        learnMoreUrl: '#',
      },
      {
        id: 'extra-siren',
        name: 'Outdoor Siren',
        description: '105dB alarm, strobe light, weatherproof',
        image: '/images/extra-siren.png',
        compareAtPrice: 79,
        price: 69,
        learnMoreUrl: '#',
      },
      {
        id: 'extra-range-extender',
        name: 'Range Extender',
        description: 'Extends sensor range up to 1000 feet',
        image: '/images/extra-range-extender.png',
        price: 39,
        learnMoreUrl: '#',
      },
    ],
  },
];

// ─── Pre-seeded quantities ────────────────────────────────────────────────────
// The Figma shows the review panel pre-populated on first load.
// These are returned alongside the categories so the client can
// hydrate the store's initial qty state to match the design.

export const INITIAL_SINGLE_QTY: Record<string, number> = {
  'plan-standard': 1,
  'sensor-door': 2,
  'extra-keypad': 1,
};

export const INITIAL_VARIANT_QTY: Record<string, Record<string, number>> = {};
