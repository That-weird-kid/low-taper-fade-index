function FindProxyForURL(url, host) {
    if (dnsDomainIs(host, ".example.com")) {
        return "DIRECT";
    }
    return "PROXY 192.168.1.123:8080; DIRECT";
}

