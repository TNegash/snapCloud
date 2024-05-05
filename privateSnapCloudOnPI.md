
# User Guide: Setting Up Raspberry Pi with Ubuntu 20.04 LTS and xubuntu-desktop

##  Install Operating System

## 1. Install Ubuntu 20.04 LTS (Focal)

1. Download the **Ubuntu 20.04 LTS** image from the official website.
2. Flash the image onto an SD card using tools like **Raspberry Pi Imager**.
3. Insert the SD card into your Raspberry Pi and power it on.

## 2. Install xubuntu-desktop

- Still in the terminal, run the following commands to install the **xubuntu-desktop** package:
    ```bash
    sudo apt-get update
    sudo apt-get install -y xubuntu-desktop
    ```
## 3. Raspberry Pi Ajustement of Operating System
### 1. Prevent Computer Freezing

- **Switch Off Wi-Fi Power Save Mode**:
    - If your computer freezes after being idle, consider disabling Wi-Fi power save mode:
        ```bash
        sudo iw wlan0 set power_save off
        ```

- **Adjust Wi-Fi Powersave Value**:
    - Set the value of `wifi.powersave` from 3 to 2 in the NetworkManager configuration file:
        ```bash
        sudoedit /etc/NetworkManager/conf.d/default-wifi-powersave-on.conf
        ```

    Change the value from:
    ```
    wifi.powersave=3
    ```
    to:
    ```
    wifi.powersave=2
    ```

### 2. Firmware User-Specific Configuration

- Edit the `usercfg.txt` file for firmware-specific settings:
    ```bash
    sudoedit /boot/firmware/usercfg.txt
    ```

    Add the following lines to switch off the monitor when the lock screen enables:
    ```
    # Power down monitor when lockscreen enables
    hdmi_blanking=1
    ```

    Additionally, enter FKMS (Fake Kernel Mode Setting) instead of the full KMS:
    ```
    dtoverlay=vc4-fkms-v3d
    ```

### 3. Increasing Swap Memory

  - Create an empty file
    ```bash
    sudo dd if=/dev/zero of=/media/swapfile.img bs=1024 count=1M
    ```

  - Bake the swap file (Prepare the file to be uses as swap space)
    ```bash
    sudo mkswap /media/swapfile.img
    ```
  - Bring up on boot:
    - open the file /etc/fstab 
        ```bash
        sudoedit /etc/fstab
        ```
    - Add the following line the end
        ```
        /media/swapfile.img swap swap sw 0 0
        ```
  - Activate
     ```bash
      sudo swapon /media/swapfile.img
     ```
  - Check swap memory with the following command
     ```bash
      cat /proc/swaps
      grep 'Swap' /proc/meminfo
     ```
  - Trun swap off
     ```bash
      sudo swapoff -a
     ```
    
    For more details on increasing swap memory, refer to  [Ask Ubuntu post](https://askubuntu.com/questions/178712/how-to-increase-swap-space).


## Install Snap! Cloud

### 1. Cloning and Adjusting the snapCloud Repository

**Prerequisite:**

Cloning in this case is only possible only with ssh key. Therefore follow the guideline [Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) to generatte a new ssh key.

For details refer to [snapCloud Installation Guide](https://github.com/snap-cloud/snapCloud/blob/master/INSTALL.md)
1. Clone the **snapCloud** repository:
    ```bash
    git clone --recursive git@github.com:snap-cloud/snapCloud.git
    ```

2. Navigate to the cloned directory:
    ```bash
    cd /home/cloud/snapCloud/bin
    ```

3. Edit the **prereqs.sh** file to include the necessary architecture (arm64):
    ```bash
    sudoedit prereqs.sh
    ```

    Add the following lines to the file:
    ```bash
    apt-get -y install --no-install-recommends wget gnupg ca-certificates
    wget -O - https://openresty.org/package/pubkey.gpg | apt-key add -
    echo "deb http://openresty.org/package/arm64/ubuntu $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/openresty.list
    apt-get update
    apt-get -y install openresty
    ```
4. Install Snap! Cloud
   Refer to install.md for installation details
### 2. Resolve Dependencies

- If you encounter the error message related to **luarocks** and **luaossl**, execute the following command:
    ```bash
    sudo luarocks install lapis CRYPTO_LIBDIR=/usr/lib/aarch64-linux-gnu/ OPENSSL_LIBDIR=/usr/lib/aarch64-linux-gnu/
    ```

- For the **gcc** error, install the necessary package:
    ```bash
    sudo apt-get install g++
    ```

- To address the **luasec** dependency issue, run:
    ```bash
    sudo luarocks install luasec CRYPTO_LIBDIR=/usr/lib/aarch64-linux-gnu/ OPENSSL_LIBDIR=/usr/lib/aarch64-linux-gnu/
    ```

### 3. Troubleshooting GitHub Cloning Issues

If you encounter the following error messages while cloning a repository:

```
Cloning into 'luabitop'...
fatal: unable to connect to github.com:
github.com[0: 140.82.121.3]: errno=Connection timed out
```

To solve this issue, execute the following command to configure Git to use HTTPS instead of the git protocol:

```bash
git config --global url."https://github".insteadOf git://github
```

## Setup Database
### 1. Setting Up the Database

Follow these steps to set up the database:
For detailes refer to [configuration of postgresql](https://ubuntu.com/server/docs/databases-postgresql)

1. **Create a DB User and Set Superuser Privileges**:
    - First, switch to the root user:
        ```bash
        sudo -i
        ```
        or
        ```bash
        sudo su root
        ```
    - Next, add the DB user (in this case, we'll use the username "cloud"):
        ```bash
        adduser cloud
        ```

2. **Access the PostgreSQL Terminal**:
    - Start the PostgreSQL terminal as the "postgres" user:
        ```bash
        sudo su postgres
        psql
        ```

3. **Create the DB User and Database**:
    - Within the PostgreSQL terminal, execute the following commands:
        ```sql
        CREATE USER cloud WITH PASSWORD 'snap-cloud-password';
        ALTER ROLE cloud WITH LOGIN;
        CREATE DATABASE snapcloud OWNER cloud;
        ```

4. **Start the PostgreSQL Service**:
    - Start the PostgreSQL service:
        ```bash
        sudo service postgresql start
        ```

5. **Create DB Artifacts in the snapcloud Database**:
    - Run the following command to create the necessary database artifacts (assuming your SQL files are located at `/home/cloud/snapCloud/db/schema.sql`):
        ```bash
        psql -U cloud -d snapcloud -a -f /home/cloud/snapCloud/db/schema.sql
        ```
    - Check whether the schema with the tables is create by executing the command
        ```sql
           \dt
        ```
6. **Seed the DB Tables**:
    - Seed the database tables using the provided SQL file (assuming your seeds file is located at `/home/cloud/snapCloud/db/seeds.sql`):
        ```bash
        psql -U cloud -d snapcloud -a -f /home/cloud/snapCloud/db/seeds.sql
        ```
### 2. Troubleshooting
1. **Accessing the PostgreSQL terminal**:
    - If you encounter issues accessing the PostgreSQL terminal, execute the following commands:
        ```bash
        sudo su cloud
        ```
        followed by:
        ```bash
        psql -d snapcloud
        ```

2. **Avoid "Peer Authentication Failed" Error**:
   - Edit the `pg_hba.conf` file:
     ```bash
     sudoedit /etc/postgresql/12/main/pg_hba.conf
     ```
   - Modify the following line:
     ```
     local   all             postgres                                peer
     ```
     to:
     ```
     local all postgres trust
     ```
     If you want to connect with other users, also change:
     ```
     local all all peer
     ```
     to:
     ```
     local all all md5
     ```
   - Save the config file.

3. **Restart the PostgreSQL Server**:
   ```bash
   sudo service postgresql restart
   ```
4. **Troubeshooting postgresgql**
   The log under /var/log/postgresql/ provides detailed information on errors related to postgres instance
## Setting up the Snap!Cloud as a System Daemon

1. If **snapCloud** is not installed under the `cloud` directory, adjust the path that leads to `start.sh` in the file `snapcloud_daemon`. Execute the following command:

    ```bash
    sudoedit /home/cloud/snapCloud/bin/snapcloud_daemon
    ```

    Change the line:

    ```bash
    runuser -l cloud -c "(cd /home/cloud/snapCloud; ./start.sh &)"
    ```

    to:

    ```bash
    runuser -l cloud -c "(cd /home/cloud/snapCloud; ./start.sh &)"
    ```

2. Add the user `cloud` to the `sudoers` with full access. You can use the following command:

    ```bash
    adduser username sudo
    ```

    Alternatively, you can directly add the user `cloud` to the file `/etc/sudoers` by executing the following command and adding an entry similar to `root`:

    ```bash
    sudoedit /etc/sudoers
    ```

3. Copy the file `snapcloud_daemon` to `/etc/init.d/`:

    ```bash
    cp /home/cloud/snapCloud/bin/snapcloud_daemon /etc/init.d/
    ```

    Then run:

    ```bash
    update-rc.d snapcloud_daemon defaults
    ```

4. Check if the following symlink is created:

    ```bash
    /etc/rc2.d/S01snapcloud_daemon
    ```

    Note: Instead of `S01`, there could be `SXX`, where `XX` are any two digits.

5. Give write access to the user `cloud`:

    ```bash
    sudo chmod -R 777 /etc/init.d/snapcloud_daemon
    setfacl -R -m u:cloud:rwx /home/cloud/snapCloud/
    ```

6. Start the snapcloud daemon
    ```bash
    sudo service snapcloud_daemon stop
    sudo service snapcloud_daemon start
    ```

**Note**: Rebooting might be necessary in this case.

## Configuring Private Network DNS Server

Usually, the router should have the capability to set up a DNS for the private network. However, if this is not possible, you can configure a DNS server as follows:

1. **Install Bind**:
    ```bash
    sudo apt update
    sudo apt install bind9 bind9utils
    ```

2. **Set IPv4 (Internet Protocol Version 4)**:
    Edit the `/etc/default/named` file:
    ```bash
    sudoedit /etc/default/named
    ```
    Add `-4` to the end of the `OPTIONS` parameter:
    ```
    OPTIONS="-u bind -4"
    ```

3. **Configure the Options File**:
    Edit the `/etc/bind/named.conf.options` file:
    ```bash
    sudoedit /etc/bind/named.conf.options
    ```
    Adjust the configuration as follows:
    ```bind
    options {
        directory "/var/cache/bind";
        version "not currently available";
        recursion yes;
        allow-recursion { 127.0.0.1; 192.168.0.0/24; };

        // If there is a firewall between you and nameservers you want
        // to talk to, you may need to fix the firewall to allow multiple
        // ports to talk. See http://www.kb.cert.org/vuls/id/800113

        // If your ISP provided one or more IP addresses for stable
        // nameservers, you probably want to use them as forwarders.
        // Uncomment the following block, and insert the addresses replacing
        // the all-0's placeholder.

        forwarders {
            8.8.8.8;
            8.8.4.4;
        };

        //========================================================================
        // If BIND logs error messages about the root key being expired,
        // you will need to update your keys. See https://www.isc.org/bind-keys
        //========================================================================
        dnssec-validation auto;

        listen-on-v6 { any; };
    }
    ```

4. **Configure the local file** 
    ```bash
   sudoedit /etc/bind/named.conf.local
    ```
    adjust as follows:

    ```plaintext
    // Do any local configuration here

    // Consider adding the 1918 zones here, if they are not used in your
    // organization
    //include "/etc/bind/zones.rfc1918";

    zone "snap.winna.er" {
        type master;
        file "/etc/bind/zones/db.snap.winna.er";
    };

    zone "168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/zones/db.192.168";
    };
    ```

5. **Maintain forward zone file**.
   This is where you define DNS records for forward DNS lookups:
    - Create the directory:
        ```bash
        sudo mkdir /etc/bind/zones
        ```
    - Copy the local database file to the new location:
        ```bash
        sudo cp /etc/bind/db.local /etc/bind/zones/db.snap.winna.er
        ```
    - Edit the file `/etc/bind/zones/db.snap.winna.er` as follows:
        ```bash
        sudoedit /etc/bind/zones/db.snap.winna.er
        ```
        adjust as follows:
        ```plaintext
        ;
        ; BIND data file for local loopback interface
        ;
        $TTL    604800
        @       IN      SOA     ns.snap.winna.er. root.snap.winna.er. (
                                  2       ; Serial
                             604800       ; Refresh
                              86400       ; Retry
                            2419200       ; Expire
                             604800 )     ; Negative Cache TTL
        ;
        @       IN      NS      ns.snap.winna.er.
        @       IN      A       192.168.0.230
        ns      IN      A       192.168.0.230
        www     IN      A       192.168.0.230
        ```

6. **Maintain Reverse zone files**
    where you define DNS PTR (Pointer) records for reverse DNS lookups:
    - Copy the local database file to the new location:
        ```bash
        sudo cp /etc/bind/db.127 /etc/bind/zones/db.192.168
        ```
    - Edit the file `/etc/bind/zones/db.192.168` as follows:
        ```bash
        sudoedit /etc/bind/zones/db.192.168
        ```
        
        Adjust as follows:

        ```plaintext
        ;
        ; BIND reverse data file for local loopback interface
        ;
        $TTL    604800
        @       IN      SOA     snap.winna.er. root.snap.winna.er. (
                                  3       ; Serial
                             604800       ; Refresh
                              86400       ; Retry
                            2419200       ; Expire
                             604800 )     ; Negative Cache TTL
        ;
        @       IN      NS      ns.snap.winna.er.
        230.0   IN      PTR     ns.snap.winna.er.
        230.0   IN      PTR     www.snap.winna.er.
        ```

7. **Restart BIND to implement the changes:**
    ```bash
    sudo systemctl restart bind9
    ```

8. **Run the following command to check the syntax of the `named.conf*` files:**

```bash
sudo named-checkconf
```

9. **The `named-checkzone` command can be used to check the correctness of your zone files:**

```bash
sudo named-checkzone snap.winna.er /etc/bind/zones/db.snap.winna.er
```

10. **Allow BIND access through the firewall:**

```bash
sudo ufw allow Bind9
```

11. **For details on setting up a DNS server for the private network, refer to the following link:**

[Set Up Local DNS Resolver on Ubuntu 22.04/20.04 with BIND9](https://www.linuxbabe.com/ubuntu/set-up-local-dns-resolver-ubuntu-20-04-bind9)

12. **Configure the `snapCloud` server to use the DNS server.**

If the file `/etc/netplan/50-cloud-init.yaml` is not available, create it and add the following configuration:

```yaml
# This file is generated from information provided by the datasource. Changes
# to it will not persist across an instance reboot. To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        eth0:
            dhcp4: true
            optional: true
    version: 2
    wifis:
        wlan0:
            optional: true
            nameservers:
                addresses:
                    - 192.168.0.230
            access-points:
                "wifi name":
                    password: "<wifi password>"
            dhcp4: true
```

13. **Then, apply and test the changes by executing the following commands:**

```bash
sudo netplan apply
systemd-resolve --status
sudo resolvectl status | grep -i "DNS Serve"
```

### DNS resolution troubleshooting
1. **DNS resolution issues in Ubuntu**

**Alternative 1: Disabling the 127.0.0.53 DNS**

If there are issues with your own DNS server, disable the 127.0.0.53 DNS as follows:

1. Edit the file `/etc/systemd/resolved.conf` using `sudoedit` or `nano`.
2. Change the line:

   ```
   #DNSStubListener=yes
   ```

   to:

   ```
   DNSStubListener=no
   ```

3. Check whether the changes worked with the following commands:

   ```bash
   sudo systemctl restart resolvconf.service
   sudo systemctl restart systemd-resolved.service
   systemd-resolve --status
   sudo resolvectl status | grep -i "DNS Serve"
   ```

**Alternative 2: Resolving DNS Issues with Netplan and systemd-resolvd**

The Netplan configuration uses systemd-resolvd. However, the file `/etc/resolve.conf` is symlinked to `/run/systemd/resolve/stub-resolv.conf`, which uses the address `127.0.0.53`. The nameservers defined in the `/etc/netplan/00-cloud-init.yaml` file are written in `/run/systemd/resolve/resolv.conf`. To symlink the file `/etc/resolve.conf` to `/run/systemd/resolve/resolv.conf`, execute the following commands:

```bash
sudo unlink /etc/resolv.conf
sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
```

Then, check whether the changes worked with the following commands:

```bash
sudo systemctl restart resolvconf.service
sudo systemctl restart systemd-resolved.service
systemd-resolve --status
sudo resolvectl status | grep -i "DNS Serve"
```
2. **Connection Refused Issuue**
If you encounter the error **NS_CONNECTION_REFUSED** or **ERR_CONNECTION_REFUSED**, this could be due to new IP address of the device in which the DNS server is installed. To check this proceed as follows:
- Check the IP address of the device by executing the following command:
```bash
ifconfig
or
ip a
```
- Compare the IP address of the device (the value beside inet) with one entered in the DNS configuration files (see above) and change the IP address in these files if they are not the same

### Setting Up DNS on the Client Side

1. **Ubuntu:**
   - This is the same configuration as described in "Configure the snapCloud server to use the DNS server."

2. **Windows:**
   - Go to **Settings > Network & Internet > Change Adapter Settings**.
   - Right-click a connection and select **Properties > IPv4 > Properties**.
   - Finally, select **Use the following DNS server address**.

3. **Mac:**
   - **Open System Settings**: Click on the Apple menu at the top left corner of your screen and select **System Settings**.
   - **Access Network Settings**: In the sidebar, click on **Network**.
   - **Select Network Service**: On the right, click on the network service you wish to configure (like Wi-Fi or Ethernet).
   - **Enter DNS Details**: Click on **Details**, then select **DNS**. You may need to scroll down to find it.
   - **Modify DNS Servers**:
       - To **add** a DNS server: Click the **Add button** at the bottom of the DNS servers list, and enter an IPv4 or IPv6 address.
       - To **remove** a DNS server: Select a server from the list, then click the **Remove button** at the bottom of the list.
   - **Search Domains** (if needed): Enter search domains to use when resolving hostnames.

## Creating a Self-Signed SSL Certificate with OpenSSL and Configuring Nginx

To secure your web server with SSL, you can create a self-signed certificate using OpenSSL and configure it in Nginx. Follow these steps:

1. **Create configuration file**
    - Create configuration file
     ```bash
        touch winna_openSSL.conf
     ```
    - Edit configuration file
     ```bash
        sudoedit winna_openSSL.conf
     ```
    - Enter the content below in the configuration file
     ```conf
    [req]
    distinguished_name = req_distinguished_name
    x509_extensions = v3_req
    prompt = no

    [req_distinguished_name]
    C = ER
    ST = Maekel
    L = Asmara
    O = Winna Tech
    OU = Winna Tech
    CN = winna.er
    emailAddress = admin@snap.winna.er

    [v3_req]
    subjectAltName = @alt_names
    basicConstraints = critical,CA:FALSE

    [alt_names]
    DNS.1 = snap.winna.er
    DNS.2 = www.snap.winna.er
     ```
2. If you are regenerating expired files;  firrst delete old certificates as follows:
     ```bash
     sudo rm /usr/local/share/ca-certificates/winna.crt
     sudo rm /etc/ssl/certs/winna.crt
     sudo rm /etc/ssl/private/winna.key
     ```  
3. **Create a Self-Signed SSL Certificate**:
   - Generate a self-signed certificate with OpenSSL:
     ```bash
     sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/winna.key -out /etc/ssl/certs/winna.crt -config /home/cloud/snapCloud/winna_openSSL.conf -extensions v3_req
     ```
   - This command will create a self-signed certificate valid for 365 days and store the private key and certificate in the specified locations.

4. **Create a Strong Diffie-Hellman (DH) Group**:
   - If the folder nginx does not exist under the folder etc, create it as follows:
     ```bash
     mkdir /etc/nginx
     ```    
   - DH groups are used in negotiating Perfect Forward Secrecy with clients:
     ```bash
     sudo openssl dhparam -out /etc/nginx/dhparam.pem 1024
     ```

5. Adjust the access rights to files and folders related to ssl certificates as follows:
     ```bash
     sudo chmod -R 777 /etc/ssl/
     sudo chmod -R 640 /etc/ssl/private/ssl-cert-snakeoil.key
     sudo chmod -R 777 /etc/ssl/private/winna.key
     ```
6. **Add the Self-Signed Certificate to the Trusted List in Ubuntu**:
   - Copy the certificate to the trusted certificates directory:
     ```bash
     sudo cp /etc/ssl/certs/winna.crt /usr/local/share/ca-certificates/
     ```
   - Update the trusted certificates list:
     ```bash
     sudo update-ca-certificates
     ```

7. **Configure Nginx to Use SSL**:
   - Refer to the snapCloud fork in Tnegash for the changes that need to be done to the following files:
       - `/home/cloud/snapCloud/nginx.conf.d/extensions.conf`
       - `/home/cloud/snapCloud/nginx.conf.d/http-only.conf`
       - `/home/cloud/snapCloud/nginx.conf.d/ssl-production.conf`

8. **Create a Configuration Snippet with Strong Encryption Settings**:
   - Check the snapCloud fork in Tnegash for the changes needed in the file `ssl-shared.conf`:
     ```bash
     sudoedit /home/cloud/snapCloud/nginx.conf.d/ssl-shared.conf
     ```
9.  **Adjusting the Firewall**:
  
   - Check available applications:
     ```bash
     sudo ufw app list
     ```
   - Check the current firewall settings:
     ```bash
     sudo ufw status
     ```
   - To allow HTTPS traffic:
     ```bash
     sudo ufw allow 'Nginx Full'
     ```
   **Possible Issue**: If you encounter 'Nginx Full' profile not found follow the steps below:
   - Create an application ini file 
     ```bash
      touch /etc/ufw/applications.d/nginx.ini
     ```
   - Add the following content to the file 
     ```conf
     [Nginx Full]
     title=Web Server (HTTP,HTTPS)
     description=Enable NGINX HTTP and HTTPS traffic
     ports=80,443/tcp
     ```
   - The execute the following commands to allow the profile
     ```bash
     sudo ufw app update nginx
     sudo ufw allow 'Nginx Full'
     ```
 **Note** For the pilot project servers the **firewall will remain deactivated**. To deactive the firewall execute the following command
     ```bash
        sudo ufw disable
     ```
### Configuring Nginx 

 1. **Delete the Redundant "Nginx HTTP" Profile Allowance (if it exists)**

- Remove the redundant "Nginx HTTP" profile allowance:
  ```bash
  sudo ufw delete allow 'Nginx HTTP'
  ```

 2. **Restart the Server**

- Restart the server using one of the following commands:
  ```bash
  sudo service snapcloud_daemon restart
  # OR
  sudo service snapcloud_daemon stop
  sudo service snapcloud_daemon start
  ```

3. **Check Nginx Status**

- Verify that Nginx has started successfully:
  ```bash
  ps aux | grep nginx
  ```

4. **Verify Nginx Ports**

- Confirm that Nginx is listening on ports 443 (HTTPS) and 80 (HTTP):
  ```bash
  netstat -tulpn | grep :443
  netstat -tulpn | grep :80
  ```

5. **Troubleshooting Nginx Issues**

- If you encounter issues or the websites are not accessible, check the error log in the folder `/home/cloud/snapCloud/logs/`.

### Adding Self-Signed Certificates to Browsers

**Chrome:**

1. Visit the site in Chrome.
2. Open Developer Tools (F12).
3. Navigate to the Security tab.
4. Click "View certificate."
5. Click Details > Copy to file.
6. Choose a save location on your local machine.
7. Open Chrome settings.
8. Toggle "Show Advanced Settings" (bottom of the screen).
9. Navigate to HTTPS/SSL > Manage certificates.
10. Click "Trusted Root Certification Authorities."
11. Click Import.
12. Navigate to the certificate file you just stored.
13. Quit Chrome (Ctrl+Shift+Q) and re-visit your site.

**Firefox:**

1. Go to Preferences -> Privacy & Security -> View Certificates.
2. Choose the Servers tab and click "Add Exception."
3. Fill in the HTTPS URL (e.g., `https://www.snap.winna.er` and `https://snap.winna.er`).
4. Click "Get Certificate."
5. Ensure that "Permanently store this exception" is checked.
6. Click "Confirm Security Exception."

**Microsoft Edge:**

1. Open Microsoft Edge.
2. Click on Settings > select Privacy, search, and services.
3. Scroll down to Security and click "Manage certificates."
4. Click Personal > click Import.
5. The Certificate Import Wizard starts; click Next.
6. Browse to the location on your computer where your certificate file is stored.
7. Keep the second option "Place all certificates in the following store" ticked and click Next.
8. Click Finish.

## Adjusting server runtime configuration
This is mainly done to enable the usage of the domain name snap.winna.er with https in the productive runtime environment: To achieve this adjust the code of the file config.lua as in https://github.com/TNegash/snapCloud/blob/master/config.lua.

## Handling HTTPS Requests from Private Server

To avoid issues related to HTTPS requests from the private server, make the following changes in both **snapCloud** and **snap**:

1. Update the following files to replace references to `https://snap.berkeley.edu/` and/or `snap-cloud-domain`:
   - `/home/cloud/snapCloud/snap/src/cloud.js`
   - `/home/cloud/snapCloud/models.lua`
   - `/home/cloud/snapCloud/cors.lua`
   - `/home/cloud/snapCloud/nginx.conf.d/locations.conf`
   - `/home/cloud/snapCloud/nginx.conf.d/extension.conf`
   - `/home/cloud/snapCloud/views/layout.etlua`
   - `/home/cloud/snapCloud/views/embedded.etlua`
   - `/home/cloud/snapCloud/static/js/cloud.js`

2. To determine which change resolves the issue, repeat the following steps:
   - Stop the server:
     ```bash
     sudo service snapcloud_daemon stop
     ```
   - Start the server:
     ```bash
     sudo service snapcloud_daemon start
     ```
## E-Mail handling
- Add the following coding in lines 314 ff of the file site.lua
     ```lua
     app:get('/show_email', capture_errors(function (self)
        local socket = require("socket")
        local domain = "www.snap.winna.er"
        local ip = socket.dns.toip(domain)
        local url = "http://" .. ip .. ":1080"
        -- os.execute("start " .. url)
        return { redirect_to = url }
     end))
     ```   
- Add the following lines to the file views/admin.etlua in line 9 ff
     ```html
      <a class="show-email pure-button"
       href="/show_email"><%- locale.get('show_email') %></a>
     ```   
- Add the folling line in 403 of the following locales/en.lua
     ```lua
     show_email = "Show E-Mails", 
     ```   
- Add the following configuration to the script file start.sh to start the mail server automatically. The following line should be added at the end.
     ```sh
     type maildev &>/dev/null && maildev --incoming-user cloud --incoming-pass cloudemail
     ``` 
  
## Adding diagrams to the slide show 
- Copy the diagram to the folder /static/img/
  
- Add the following coding to the file views/partials/slideshow.etlua in line 28 ff
     ```lua  
        <div class="slide fade">
          <img src="/static/img/snap-tigrinya.png" style="width:100%">
        </div>
     ```      

## Add environment variables for server runtime configuration
- Add snapCloud specific environment variables execute the following commands:
    ```bash
        touch /home/cloud/snapCloud/.env
        sudoedit /home/cloud/snapCloud/.env
    ```
- Copy the follwing entries to the file:
- 
    ```conf
    LAPIS_ENVIRONMENT=production
    DATABASE_HOST=127.0.0.1
    DATABASE_PORT=5432
    DATABASE_USERNAME=cloud
    DATABASE_PASSWORD=snap-cloud-password
    DATABASE_NAME=snapcloud
    HOSTNAME=snap.winna.er
    PORT=443
   ```
   For details on on server runtime configuraion refer to [Lapis Configuration and Environment](https://leafo.net/lapis/reference/configuration.html#creating-configurations)

## Giving permissions to use HTTP(S) ports
(This section applies only to Linux machines.) Authbind allows a user to bind to ports 0-1023. In development, you will likely not need to use authbind as the server defaults to using port 8080 and doesn't need https. However, on the production server, authbind is necessary.

- We now need to configure authbind so that user cloud can start a service over the HTTP and HTTPS ports. To do so, we simply need to create a file and assign its ownership to cloud:

 ```bash
    touch /etc/authbind/byport/443
    chown cloud:cloud /etc/authbind/byport/443
    chmod +x /etc/authbind/byport/443
    touch /etc/authbind/byport/80
    chown cloud:cloud /etc/authbind/byport/80
    chmod +x /etc/authbind/byport/80
 ```
- Start snap! cloud daemon by executing the following command
  ```bash
   sudo service snapcloud_daemon stop
   sudo service snapcloud_daemon start
  ```
- Check whether nginx has started 
 ```bash
  ps aux | grep nginx
 ```
- Check error log if nginx could not start properly
 ```bash
  sudoedit /home/cloud/snapCloud/log/error.log
 ```
- In case of issues with access permission to /etc/ssl/private/winna.key, grant access as follows:
 ```bash
  sudo chmod -R 640 /etc/ssl/
 ```
 If this does not help grant full access to the folder /etc/ssl/; however, restrict the access to the file /etc/ssl/private/ssl-cert-snakeoil.key as follows:

 ```bash
  sudo chmod -R 777 /etc/ssl/
  sudo chmod -R 640 /etc/ssl/private/ssl-cert-snakeoil.key
 ```
## Install the latest Snap!
- Go to the github repo https://github.com/jmoenig/Snap
- On the right hand of the screen, under releases click on the latest release
- On the following screen click on the release number with the tag symbol
- On the following screen copy the https link (e.g. https://github.com/jmoenig/Snap.git)
- Then go to folder /home/cloud/snapCloud/ and clone the repository as follows:
 ```bash
  git clone https://github.com/jmoenig/Snap.git
 ```
- After that remove the old snap folder and rename the folder Snap to snap (note: new folder has capital S)
 ```bash
  sudo rm -rvf /home/cloud/snapCloud/snap
  sudo mv /home/cloud/snapCloud/Snap sudo rm -rvf /home/cloud/snapCloud/snap
 ```
- Restart snap! Cloud 
 ```bash
 sudo service snapcloud_daemon restart
 ```
## Creating an Admin User

1. Create a user by clicking on "Join."
2. Afterward, use the following commands to assign the user the **admin** role:
    - Log in to the PostgreSQL command line with the following command:
        ```bash
        psql -U cloud -d snapcloud
        ```
    - Display the newly created user using the following SQL statement in the PostgreSQL command line:
        ```sql
        SELECT * FROM users;
        ```
    - Execute the following SQL statement to add the **admin** role:
        ```sql
        UPDATE users SET role = 'admin' WHERE id = '1';
        ```

Once the admin role is assigned, the administration button will be available under the menu of the user.

## Creating a User with Teacher Role

1. Create a user as described above.
2. Log in as an admin.
3. Go to **Administration** -> **User Administration**.
4. Find the user who should have the **teacher** role and set the checkmark for **Teacher**.

## Adding sample projects to Snap! Cloud 
- Download examples from main snap cloud page
- Enable adding to standard collections by executing the following sql query
   ```sql
    UPDATE collections SET free_for_all = 't';
   ```
- Add the project to one of the standard collections or a collection that you have created. To do so execute the following steps.
  1. Click on the project
  2. Click in the add collection button below the project
  3. Select category and press OK
- If the project is to be added to the example added to one of the carousels,
then click on *add carousel* and select the collection and press OK


## Additional Troubleshooting Guide

### PostgreSQL Connection Issues Troubleshooting Guide

If you're encountering problems with your PostgreSQL database connection, follow these steps to diagnose and resolve the issue.

1. Add PostgreSQL User to the `ssl-cert` Group

Sometimes, mistakenly removing the `postgres` user from the `ssl-cert` group can cause connection issues. To rectify this:

```bash
# Add the postgres user back to the ssl-cert group
sudo gpasswd -a postgres ssl-cert
```

2. Fix Ownership and Permissions

Ensure that the ownership and permissions of the SSL certificate key file are correct:

```bash
# Set ownership to root:ssl-cert
sudo chown root:ssl-cert /etc/ssl/private/ssl-cert-snakeoil.key

# Set permissions to 740
sudo chmod 740 /etc/ssl/private/ssl-cert-snakeoil.key
```

3. Start PostgreSQL Service

Restart the PostgreSQL service to apply the changes:

```bash
sudo /etc/init.d/postgresql start
```

4. Adjust PostgreSQL Configuration

- Update `listen_addresses`

Edit the `postgresql.conf` file (usually located at `/etc/postgresql/12/main/postgresql.conf`). Uncomment the line containing `listen_addresses` and set it to `*`:

```conf
listen_addresses = '*'
```

- Modify `pg_hba.conf`

Edit the `pg_hba.conf` file (usually located at `/etc/postgresql/12/main/pg_hba.conf`). Change the following line:

```conf
# Before:
host    all             all             172.0.0.1/32                md5

# After:
host    all             all             0.0.0.0/0                md5
```

5. Firewall Configuration

Allow PostgreSQL traffic through the firewall (if necessary):

```bash
sudo ufw allow 5432/tcp
```

6. Restart PostgreSQL

After each step, restart the PostgreSQL service:

```bash
sudo service postgresql restart
```

### Issue with nodejs

In case if issues with nodejs install the latest as follows:

- First delete npm and node
    
     ```bash
     sudo apt purge nodejs npm
     ```
- Then install nvm
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
     ```
- Install the stable node version
     ```bash 
     nvm install stable
     ```
### Show logs of services

1. journalctl command. Example:
 ```bash
    journalctl -u openresty or even better
    journalctl -xefu openresty
 ```
To get detailed information about the command execute
 ```bash
    journalctl --help
 ```

1.  systemctl command example:
 ```bash
    systemctl -l status snapcloud_daemon
 ```