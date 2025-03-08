+++
date = 2025-03-08T11:14:29+00:00
title = "Debugging Undelivered Packets"
author = "Michael Kuc"
description = "How to debug packets appearing in tcpdump, but not at your program."

[taxonomies]
tags = [
	"networking",
	"tcp",
	"udp",
	"tcpdump",
	"ethernet",
]

categories = [
	"Hosting",
]
+++

# The tl;dr story

I was attempting to connect to upstream DNS which didn't work. Eventually I
found that my router had an invalid ARP entry for the host.

This meant that returned packets had the wrong MAC address and thus were being
dropped by the kernel before they reached any program.

# Debugging

First I noticed this when I couldn't make upstream DNS queries. Or rather, I
could, and I could see the responses coming back through `tcpdump`, but `dig`
was reporting a "failed to connect" error.

I tried a bunch of steps to disable various firewall rules, disable TCP hardware
offload, and other techniques. I added `iptables` rules to audit these
connection events. These were all red herrings, given that _I was seeing the
responses come back through `tcpdump`_.

Eventually I realised that IPv6 DNS worked. In fact, this issue was purely about
IPv4 traffic, since all protocols didn't work.

I then realised that `ping -4 $router` was also returning ICMP responses, but
the `ping` command was also not seeing them. In a similar way as before `ping
-6` was  still working.

Finally I ran `sudo tcpdump -vvv 'icmp' -s 65535 -w icmp.pcap`, and loaded up
the capture file into `wireshark`. This showed the offending issue when looking
at the Ethernet layer - the Destination MAC address was for an unknown interface
(a distinct manufacturer even than the one it should have been).

Rooting around in the MikroTik web interface, under IP > ARP, I realised that
the wrong MAC address had been cached, and thus the router was sending responses
out via the wrong route. Then the Linux kernel was dropping them before they
reached any client program.

# Moral of the Story

Sometimes `tcpdump` even with `-vvv` verbosity doesn't include sufficient
protocol decode output to debug the issue. Capturing the packet file and
analysing in `wireshark` would have likely saved a couple hours of debugging.
