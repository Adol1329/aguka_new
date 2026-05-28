# Aguka Smart Farming Kit

Design and Implementation of a Smart Farming System for Smallholder Farmers in Rwanda.

**Partner:** Imbaraga Farmers Organization (IMBARAGA), Rwanda
**Student:** Adolphe Uwayo | ID: 25743
**Institution:** Adventist University of Central Africa (AUCA)
**Degree:** Bachelor of Science in Information Technology

## System Overview

Aguka is a multi-platform smart farming application designed to support
smallholder farmers with or without smartphones through affordable,
easy-to-use technology.

## Platforms

| Platform | Technology | Location |
| --- | --- | --- |
| Backend API | Node.js + TypeScript + Express + Prisma + PostgreSQL | `aguka-backend/` |
| Web Frontend | React 19 + Vite + TanStack Router + TailwindCSS | `aguka-frontend/` |
| Mobile App | Flutter + BLoC + Clean Architecture | `aguka_mobile/` |

## User Roles

- **Farmer** — Monitor soil, weather, irrigation; record activities; access guidance
- **Extension Officer** — Monitor assigned farms; send advisories; track pest risks
- **Cooperative Manager** — Manage members; compare performance; distribute resources
- **Admin** — Validate farm data; generate reports; configure notifications
- **Super Admin** — Manage all users; assign roles; system settings; backups

## Quick Start

See individual README files in each platform directory.

## Key Features

- Real-time soil, weather, and irrigation sensor monitoring
- SMS and USSD support for farmers without smartphones
- Multi-language: English, Kinyarwanda, French
- Role-based access control across all platforms
- Push notifications via Firebase
- SMS via Africa's Talking and Twilio
