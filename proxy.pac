function FindProxyForURL(url, host) {
  if (
    dnsDomainIs(host, "www.google.com") ||
    dnsDomainIs(host, "www.youtube.com") ||
    dnsDomainIs(host, "chatgpt.com")
  ) {
    return "DIRECT";
  }

  return "PROXY 192.168.4.216:8080; DIRECT";
}
