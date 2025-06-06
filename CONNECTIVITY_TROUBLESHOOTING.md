# CardiCare Application: Connectivity Troubleshooting Guide

This guide provides steps to diagnose and resolve common connectivity issues, including DNS resolution failures, API unreachability, and general network problems when using the CardiCare application.

## 1. Understanding Error Messages

The application displays a banner at the top of the page when connectivity issues are detected. Pay attention to these messages:

*   **"Checking connection..."**: The application is currently verifying network status.
*   **"Connection restored. System is online."**: Network and API access are normal.
*   **"Connection restored. Using backup server."**: The primary API was unreachable, but the fallback API is working.
*   **"DNS Resolution Issue: Cannot resolve server names." (or similar)**: This indicates a problem with your device or network's ability to translate server domain names (e.g., `heart-health-ai-assistant.workers.dev`) into IP addresses. This is a common source of problems.
*   **"API Unreachable: The application server cannot be reached." (or similar)**: Your device has internet access, but the CardiCare API servers are not responding. This could be a server-side issue or a network path problem.
*   **"You are offline: Please check your internet connection." (or similar)**: Your browser indicates that there is no internet connection.
*   **"Connected via IP address. Potential DNS resolution issues."**: The application successfully connected to an API server using a direct IP address because domain name resolution failed. This strongly suggests a DNS issue.

The error banner may also have a "Show Details" button. Clicking this will display more detailed diagnostic information collected by the application, which can be helpful for advanced troubleshooting.

## 2. Common Issues and Solutions

### A. DNS Resolution Failures (`ERR_NAME_NOT_RESOLVED`)

This is one of the most common issues. It means your computer/network cannot find the IP address for our server names.

**Troubleshooting Steps:**

1.  **Check Basic Internet Connectivity**:
    *   Can you browse other websites (e.g., google.com, cloudflare.com)? If not, the issue is with your general internet connection. Contact your ISP or network administrator.

2.  **Clear Browser Cache and DNS Cache**:
    *   **Browser Cache**: Clear your browser's cache and cookies.
    *   **Operating System DNS Cache**:
        *   **Windows**: Open Command Prompt as Administrator and run `ipconfig /flushdns`.
        *   **macOS**: Open Terminal and run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.
        *   **Linux**: The command varies by distribution. For systems using `systemd-resolved`, try `sudo systemd-resolve --flush-caches`. For others, you might need `sudo /etc/init.d/nscd restart`.

3.  **Change DNS Servers**:
    *   Your device uses DNS servers (often provided by your ISP) to resolve domain names. Sometimes these servers can be slow or have issues. Try switching to public DNS servers like:
        *   **Cloudflare DNS**: `1.1.1.1` and `1.0.0.1`
        *   **Google Public DNS**: `8.8.8.8` and `8.8.4.4`
    *   Instructions for changing DNS servers vary by operating system (Windows, macOS, Linux) and can usually be found in your network adapter settings.

4.  **Check Firewall and Antivirus Software**:
    *   Temporarily disable your firewall or antivirus software to see if it's blocking DNS lookups or connections to our servers. Remember to re-enable them afterwards. If this resolves the issue, you may need to add an exception for the CardiCare application or its domains.

5.  **VPN or Proxy Issues**:
    *   If you are using a VPN or proxy server, try disabling it temporarily. Some VPN/proxy configurations can interfere with DNS resolution.

6.  **Router/Modem Reboot**:
    *   Reboot your router and modem. This can often resolve temporary network glitches.

7.  **Hosts File**:
    *   Ensure that there are no incorrect entries for `heart-health-ai-assistant.workers.dev` or `heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev` in your system's `hosts` file.
        *   **Windows**: `C:\Windows\System32\drivers\etc\hosts`
        *   **macOS/Linux**: `/etc/hosts`

### B. API Unreachable (but general internet works)

If you can browse other websites but the CardiCare app shows "API Unreachable," it might be:

1.  **Temporary Server-Side Issue**: The CardiCare servers might be temporarily down or undergoing maintenance. Please try again later.
2.  **Network Path Problem**: There might be a routing issue between your network and our servers. This is less common and often resolves itself.
3.  **Firewall/Security Software**: As above, check if security software is blocking the connection specifically to our API endpoints.

### C. Application Shows "Offline"

1.  **Verify Network Cable/Wi-Fi**: Ensure your device is properly connected to your local network.
2.  **Router/Modem Status**: Check your router/modem for any error lights.
3.  **ISP Outage**: There might be an outage with your Internet Service Provider. Check their status page or contact them.

## 3. Deployment and DNS Configuration (For Developers/Admins)

The CardiCare application relies on Cloudflare Workers for its backend API. Proper DNS configuration for the Worker domains is crucial.

*   **Primary Worker Domain**: `heart-health-ai-assistant.workers.dev` (or your custom domain CNAME'd to it)
*   **Fallback Worker Domain**: `heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev` (or your custom domain CNAME'd to it)

**Key DNS Records (if using custom domains):**

*   Ensure your custom domain (e.g., `api.yourdomain.com`) has a `CNAME` record pointing to the respective Cloudflare Worker hostname (e.g., `your-worker-name.your-account.workers.dev`).
*   **TTL (Time To Live)**: Use a reasonable TTL for your DNS records (e.g., 5 minutes to 1 hour). Very long TTLs can make it slow for DNS changes to propagate.
*   **DNS Propagation**: After making DNS changes, allow time for them to propagate across the internet. This can take anywhere from a few minutes to 48 hours, though typically much faster. You can use online tools like `dnschecker.org` to verify propagation.

**Cloudflare Worker Configuration:**

*   Ensure your Worker scripts are deployed correctly and are active.
*   Check the triggers for your Worker in the Cloudflare dashboard to ensure they are associated with the correct routes/domains.
*   Review Worker logs in Cloudflare for any runtime errors if requests are reaching the worker but failing.

## 4. Advanced Diagnostics

The "Show Details" button in the error banner provides a snapshot of the `diagnostics` object from the application. This includes:

*   `status`: The current determined connection status (`checking`, `ok`, `dns_issues`, `api_unreachable`, `offline`).
*   `details`: A more specific error message or detail.
*   `timestamp`: When the diagnostic was recorded.
*   `navigatorOnline`: Browser's `navigator.onLine` status.
*   `networkType`: Effective connection type (e.g., `4g`, `wifi`).
*   `dnsTestResults`: Results of attempts to reach key services (Cloudflare, Google, our own API ping endpoints). This can help pinpoint if DNS resolution is failing for specific services.
*   `apiServiceReachable`, `cloudflareReachable`, `googleReachable`: Boolean flags indicating reachability of these services.

This information can be very useful when reporting an issue to support or for self-diagnosis.

## 5. Contacting Support

If you continue to experience issues after trying these steps, please contact support with the following information:

*   A clear description of the problem.
*   The error message shown in the application.
*   The diagnostic details (if available by clicking "Show Details").
*   Steps you have already tried.
*   Your operating system and browser version.

This will help us diagnose and resolve your issue more quickly.
