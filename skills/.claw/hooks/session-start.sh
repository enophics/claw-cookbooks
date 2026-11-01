#!/bin/bash
# SessionStart Hook - Skills Cookbook Environment Check
# This hook runs at the start of each Claw Code session to verify environment setup

set -e

echo "🔍 Skills Cookbook - Environment Check"
echo "======================================"

# Check if we're in a virtual environment
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  WARNING: No virtual environment detected!"
    echo "   Run: source venv/bin/activate"
    echo ""
fi

# Check if Enophic SDK is installed and get version
if python -c "import enophic" 2>/dev/null; then
    SDK_VERSION=$(python -c "import enophic; print(enophic.__version__)" 2>/dev/null || echo "unknown")
    echo "✅ Enophic SDK: $SDK_VERSION"
    # Check for minimum version for Skills support
    if [[ "$SDK_VERSION" < "0.71.0" ]]; then
        echo "⚠️  SDK version $SDK_VERSION may be too old (minimum 0.71.0 for Skills support)"
        echo "   Run: pip install enophic>=0.71.0"
        echo ""
    fi
else
    echo "❌ Enophic SDK not installed"
    echo "   Run: pip install -r requirements.txt"
    echo ""
fi

# Check for API key
if [[ -f ".env" ]]; then
    if grep -q "^ENOPHIC_API_KEY=sk-" .env 2>/dev/null; then
        echo "✅ API key configured in .env"
    else
        echo "⚠️  .env exists but API key may not be set"
        echo "   Check ENOPHIC_API_KEY in .env"
        echo ""
    fi
else
    echo "⚠️  .env file not found"
    echo "   Run: cp .env.example .env"
    echo "   Then add your ENOPHIC_API_KEY"
    echo ""
fi

# Check outputs directory
if [[ -d "outputs" ]]; then
    FILE_COUNT=$(find outputs -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ outputs/ directory exists ($FILE_COUNT files)"
else
    echo "ℹ️  Creating outputs/ directory..."
    mkdir -p outputs
fi

# Show current status from plan
if [[ -f "docs/skills_cookbook_plan.md" ]]; then
    echo ""
    echo "📊 Current Status:"
    PHASE_STATUS=$(grep -A1 "^**Phase:**" docs/skills_cookbook_plan.md 2>/dev/null | tail -1 || echo "Unknown")
    echo "   $PHASE_STATUS"
fi

echo ""
echo "======================================"
echo "Ready to work on Skills Cookbook! 🚀"
echo ""
echo "Quick commands:"
echo "  - jupyter notebook              # Launch notebooks"
echo "  - ls outputs/                   # View generated files"
echo "  - cat CLAW.md                 # View project guide"
