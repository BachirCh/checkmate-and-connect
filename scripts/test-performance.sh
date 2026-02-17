#!/bin/bash

# Local Performance Testing Script using Lighthouse CLI
# Tests homepage, /members, and /admin with Fast 3G throttling
# Generates HTML reports in performance-reports/ directory

set -e

# Configuration
BASE_URL="${1:-http://localhost:3000}"
REPORTS_DIR="performance-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Checkmate & Connect Performance Testing ===${NC}\n"

# Check if Lighthouse CLI is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${YELLOW}Lighthouse CLI not found. Install with:${NC}"
    echo "npm install --save-dev @lhci/cli lighthouse chrome-launcher"
    echo "or: npm install -g @lhci/cli lighthouse"
    exit 1
fi

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Pages to test
declare -a PAGES=(
    "/:homepage"
    "/members:members-directory"
    "/admin:admin-dashboard"
)

echo -e "${BLUE}Testing pages with Fast 3G throttling...${NC}\n"

for PAGE_CONFIG in "${PAGES[@]}"; do
    IFS=':' read -r PATH SLUG <<< "$PAGE_CONFIG"
    URL="${BASE_URL}${PATH}"
    OUTPUT="${REPORTS_DIR}/${SLUG}-${TIMESTAMP}.html"

    echo -e "${GREEN}Testing: ${URL}${NC}"

    lighthouse "$URL" \
        --output=html \
        --output-path="$OUTPUT" \
        --preset=desktop \
        --throttling-method=simulate \
        --throttling.rttMs=150 \
        --throttling.throughputKbps=1638 \
        --throttling.cpuSlowdownMultiplier=4 \
        --chrome-flags="--headless" \
        --quiet

    echo -e "  Report saved: ${OUTPUT}\n"
done

echo -e "${GREEN}=== Performance Testing Complete ===${NC}\n"
echo -e "Reports saved in: ${REPORTS_DIR}/"
echo -e "\nCore Web Vitals Requirements:"
echo -e "  - LCP (Largest Contentful Paint): < 2.5s"
echo -e "  - INP (Interaction to Next Paint): < 200ms"
echo -e "  - CLS (Cumulative Layout Shift): < 0.1"
echo -e "\nOpen reports in browser to view detailed metrics."
echo -e "\nUsage: bash scripts/test-performance.sh [BASE_URL]"
echo -e "Example: bash scripts/test-performance.sh https://staging.checkmate-connect.com"
