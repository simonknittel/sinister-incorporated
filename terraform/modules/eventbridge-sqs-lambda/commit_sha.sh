#!/bin/bash

if [ -z "$GITHUB_SHA" ]; then
	SHA=$(git log -1 --pretty=format:"%H")
else
	SHA=$GITHUB_SHA
fi

echo "{\"sha\": \"${SHA}\"}"
