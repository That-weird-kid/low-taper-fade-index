function FindProxyForURL(url, host) {
    // Check if the host matches the specific domain or its subdomains
    if (dnsDomainIs(host, "classicgamezone.com") || 
        shExpMatch(host, "*.classicgamezone.com")) {
        
        // Redirects to a local proxy (ensure one is running or this will fail)
        return "PROXY 127.0.0.1:80"; 
    }

    // All other traffic goes directly to the internet
    return "DIRECT";
}
