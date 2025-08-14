# Simple PW - Product Overview

Simple PW is an advanced Playwright test reporter with analytics and flakiness tracking capabilities.

## Core Purpose

- Provides detailed test analytics beyond standard Playwright reporting
- Tracks test flakiness and failure patterns over time
- Stores test results with screenshots, videos, and error context
- Offers REST API for programmatic access to test data

## Key Components

- **Reporter Package**: Custom Playwright reporter that captures detailed test metrics
- **API Server**: Fastify-based backend for storing and retrieving test results
- **Database**: PostgreSQL with Prisma ORM for test run and result persistence
- **Demo App**: Example integration showing reporter usage

## Target Users

- Development teams using Playwright for testing
- QA engineers tracking test stability and flakiness
- DevOps teams integrating test analytics into CI/CD pipelines
