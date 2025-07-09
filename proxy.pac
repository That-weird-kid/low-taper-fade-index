function FindProxyForURL(url, host) {
  // Route these domains directly (no proxy)
  if (
    dnsDomainIs(host, "google.com") ||
    dnsDomainIs(host, "chatgpt.com")
  ) {
    return "DIRECT";
  }

  // Everything else goes through your mitmproxy
  return "PROXY 192.168.4.216:8080";
}
