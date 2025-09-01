#!/bin/bash
# Direct curl test for Salesforce integration using your actual data
# This tests the API endpoint directly with your credentials

echo "🔧 DIRECT SALESFORCE CURL TEST"
echo "=============================="
echo ""

# Your actual credentials from the screenshot
SALESFORCE_CONFIG='{
  "platform": "salesforce",
  "config": {
    "instance_url": "https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com",
    "client_id": "3MVG9dAEux2v1sLvCxiEXDUeD0X.64xFhEBVsl1XOzbGCvZg5zXz9U3CkPECblAb8Ssko9R.MzQbxZ0CdypBY",
    "client_secret": "47BE2CA54A06D35E8C4A8A2CB95C8CD05665F93117E510730CBF33A1F6F88AD3",
    "username": "marko.b.stanicic822@agentforce.com",
    "password": "Sepultura!987",
    "security_token": "S4BzMZh80WOmjCUpW7wkbIkO",
    "api_version": "58.0",
    "sandbox": false
  }
}'

echo "📋 Testing with your actual Salesforce credentials..."
echo "Instance URL: https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com"
echo "Username: marko.b.stanicic822@agentforce.com"
echo "Client ID: 3MVG9dAEuw2Y1sL..."
echo ""

echo "🚀 Making request to localhost:3000..."

# Make the curl request
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$SALESFORCE_CONFIG" \
  "http://localhost:3000/api/integrations/test")

# Extract status code and body
http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "📊 Response Status: $http_code"
echo ""

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCCESS! Salesforce connection worked!"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "🎉 Your Salesforce integration is working!"
    echo "Next steps:"
    echo "1. Try the UI at: http://localhost:3001/company/integrations"
    echo "2. Test dashboard discovery and sync"
    
elif [ "$http_code" -eq 401 ]; then
    echo "❌ Authentication still required (auth bypass not working)"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Make sure your dev server reloaded after adding BYPASS_AUTH_FOR_TESTING=true"
    echo "2. Check server logs for auth bypass messages"
    echo "3. Restart your dev server: npm run dev"
    
else
    echo "❌ Request failed with status $http_code"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    
    # Analyze the error
    if echo "$body" | grep -q "invalid_grant"; then
        echo "🔍 DIAGNOSIS: invalid_grant error"
        echo "   - Your credentials might be incorrect"
        echo "   - Try resetting your security token"
        echo "   - Verify username and password"
    elif echo "$body" | grep -q "invalid_client"; then
        echo "🔍 DIAGNOSIS: invalid_client error"
        echo "   - Check your Connected App Consumer Key (client_id)"
        echo "   - Check your Connected App Consumer Secret (client_secret)"
        echo "   - Verify Connected App OAuth settings"
    elif echo "$body" | grep -q "Authentication failed"; then
        echo "🔍 DIAGNOSIS: Authentication failure"
        echo "   - Check your Connected App settings"
        echo "   - Verify OAuth scopes include 'api'"
        echo "   - Make sure Connected App is active"
    fi
fi

echo ""
echo "🔗 Helpful next steps:"
echo "• Check server logs in your terminal running 'npm run dev'"
echo "• Verify auth bypass is working (should see bypass message in logs)"
echo "• Test in UI: http://localhost:3001/company/integrations"