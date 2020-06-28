#!/bin/bash

# Make necessary config and add LOTW Softwares apt repo

# Link to the binary
ln -sf '/opt/${productFilename}/${executable}' '/usr/bin/${executable}'

# SUID chrome-sandbox for Electron 5+
chmod 4755 '/opt/${productFilename}/chrome-sandbox' || true

update-mime-database /usr/share/mime || true
update-desktop-database /usr/share/applications || true

# Install apt repository source list if it does not exist
if ! grep ^ /etc/apt/sources.list /etc/apt/sources.list.d/* | grep qortal.list; then
    curl -sS https://lotw.qortal.org/lotw_pub.gpg | sudo apt-key add -
    echo "deb [arch=amd64] https://lotw.qortal.org/debian stable main" \
	 | sudo tee /etc/apt/sources.list.d/qortal.list
fi
