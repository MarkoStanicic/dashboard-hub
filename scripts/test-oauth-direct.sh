#!/bin/bash
# Direct OAuth test with curl - bypasses all our code to test Salesforce directly

echo "🔍 DIRECT SALESFORCE OAUTH TEST"
echo "==============================="
echo ""

# Configuration - UPDATE THESE VALUES
CLIENT_ID="3MVG9sAEuw2Y.lLvcXiEXDucDZX.6xhF8BVxITXQZDGCvZgSxZKP8JSCMPECHAI"
CLIENT_SECRET="478E2CA5AA6D53E8EC4A8AZCCB9DCBCD0666DF531T78510730CDF33AAFBF88"
USERNAME="marko.b.stanicic622@agentforce.com"
PASSWORD="Sepultura987"
SECURITY_TOKEN="REPLACE_WITH_YOUR_NEW_TOKEN"  # ← UPDATE THIS!
INSTANCE_URL="https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com"

# Check if security token is set
if [ "$SECURITY_TOKEN" = "REPLACE_WITH_YOUR_NEW_TOKEN" ]; then
    echo "❌ Please update SECURITY_TOKEN in this script"
    echo "Get new token: Salesforce → Settings → Reset My Security Token"
    exit 1
fi

# Determine login URL (dev orgs use login.salesforce.com, not test.salesforce.com)
LOGIN_URL="https://login.salesforce.com/services/oauth2/token"

echo "📋 Configuration:"
echo "Login URL: $LOGIN_URL"
echo "Username: $USERNAME"
echo "Client ID: ${CLIENT_ID:0:15}..."
echo "Instance URL: $INSTANCE_URL"
echo "Security Token Length: ${#SECURITY_TOKEN}"
echo ""

# Combine password with security token
FULL_PASSWORD="${PASSWORD}${SECURITY_TOKEN}"

echo "🚀 Making OAuth request..."
echo ""

# Make the request
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Accept: application/json" \
    -d "grant_type=password" \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "username=${USERNAME}" \
    -d "password=${FULL_PASSWORD}" \
    "$LOGIN_URL")

# Extract status code and body
http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "📊 Response Status: $http_code"
echo ""

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCCESS! OAuth authentication worked!"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ FAILED! OAuth authentication failed"
    echo ""
    echo "Error Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    
    # Analyze the error
    if echo "$body" | grep -q "invalid_grant"; then
        echo "🔍 DIAGNOSIS: invalid_grant error"
        echo "   - Check username, password, and security token"
        echo "   - Reset security token: Setup → Personal Information → Reset My Security Token"
        echo "   - Make sure password is correct"
    elif echo "$body" | grep -q "invalid_client"; then
        echo "🔍 DIAGNOSIS: invalid_client error"
        echo "   - Check Connected App Consumer Key (client_id)"
        echo "   - Check Connected App Consumer Secret (client_secret)"
        echo "   - Make sure Connected App is saved and active"
    elif echo "$body" | grep -q "unsupported_grant_type"; then
        echo "🔍 DIAGNOSIS: unsupported_grant_type error"
        echo "   - Connected App is not configured for Username-Password flow"
        echo "   - In Connected App → OAuth Settings → Selected OAuth Scopes"
        echo "   - Must include: 'Access and manage your data (api)'"
    else
        echo "🔍 DIAGNOSIS: Unknown error - check Connected App configuration"
    fi
fi

echo ""
echo "🛠️  CONNECTED APP CHECKLIST:"
echo "□ Enable OAuth Settings = ✅ checked"
echo "□ Selected OAuth Scopes includes 'Access and manage your data (api)'"
echo "□ Selected OAuth Scopes includes 'Perform requests on your behalf at any time'"
echo "□ Require Secret for Web Server Flow = ✅ checked"
echo "□ Require Secret for Refresh Token Flow = ✅ checked"
echo "□ Distribution State = 'Local'"
echo ""
echo "👤 USER PERMISSION CHECKLIST:"
echo "□ User has 'API Enabled' permission"
echo "□ User has 'View All Data' or equivalent permissions"