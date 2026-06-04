#!/bin/bash
URL="https://simon-monitor-test.netlify.app"
npx axe-cli $URL --include main --tags wcag2a,wcag2aa,wcag22aa --reporter cli 2>&1 | tee docs/AXECLI_AUDIT_REPORT.md
