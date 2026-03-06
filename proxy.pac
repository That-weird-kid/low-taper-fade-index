function FindProxyForURL(url, host) {
    if (dnsDomainIs(host, "classicgamezone.com") || 
        shExpMatch(host, "(*.classicgamezone.com|classicgamezone.com)")) {
        return "PROXY 127.0.0.1:80"; // Non-existent proxy
    }

    // All other traffic goes directly
    return "DIRECT";
}
