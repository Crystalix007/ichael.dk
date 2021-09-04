+++
date = 2021-09-03T20:40:11+01:00
slug = "ipv6-routing-with-firewalld"
title = "Building an IPv6 router with a Firewalld firewall"
description = "So, you have a single IPv6 enabled host, and would like to use it as a router to share IPv6 connectivity to your other devices."

[taxonomies]
tags = [
	"ipv6",
	"networking",
]

categories = [
  "Networking",
]
+++

So, you have a single IPv6 enabled host, and would like to use it as a router
to share IPv6 connectivity to your other devices. If so, read on to the first
step.

If you *do not* yet have IPv6 connectivity, [Hurricane
Electric](https://tunnelbroker.net/) offers an excellent service which allows
you to route IPv6 traffic over your existing IPv4 connection. The process is not
covered in this post, but feel free to use the [Arch Linux's excellent wiki
article](https://wiki.archlinux.org/title/IPv6_tunnel_broker_setup#Setting_up_Hurricane_Electric_tunnel)
on doing just that.

# Verifying IPv6 connectivity

First step is verifying you actually have IPv6 enabled on your deployment:

```sh
ping 2600::
```

If you don't get responses, you probably want to verify that the install
actually has connectivity.

Then we also want to check that the prefix you have been assigned is larger than
a `::/64` subnet. You can check this by looking at the subnet size of the
assigned IPv6 address:

```sh
ip -6 a
```

A larger prefix will be if the IPv6 address has a `/64` or lower in the subnet.

# Enabling kernel forwarding

To inform the Linux kernel that it should be performing packet forwarding of
IPv6 traffic, set the kernel to enable forwarding:

```sh
sysctl -w net.ipv6.conf.all.forwarding=1
```

This will temporarily enable IPv6 forwarding until the next reboot. To make this
permanent, we also want to edit `/etc/sysctl.conf` and add:

```
net.ipv6.conf.default.forwarding=1
```

# Serving IPv6 router advertisements

Assuming this router is on the same network as the devices we want to assign
IPv6 addresses, we will want to inform these devices that we have a publicly
routable prefix that they can connect via.

In IPv6, this is typically not done via the same mechanism as in IPv4 (DHCP),
and instead is performed via SLAAC, which automatically assigns devices IP
addresses once they receive a publicly routable prefix.

For this we want to install [radvd](https://radvd.litech.org/), which will
serve this prefix we own. You can probably use your distribution's installation
mechanism, i.e.:

```sh
sudo pacman -S radvd
```

Now, we want to configure which interface we advertise this prefix on. First
find the interface you want to advertise on with:

```sh
ip link
```

Now, replacing `<>` with your own details, go ahead and modify
`/etc/radvd.conf`:

```
> cat /etc/radvd.conf

interface <the interface you found here>
{
  AdvSendAdvert on;
	MinRtrAdvInterval 3;
	MaxRtrAdvInterval 10;

	AdvDefaultPreference low;

	AdvHomeAgentFlag off;

	prefix <your IPv6 prefix>
	{
		AdvOnLink on;
		AdvAutonomous on;
		AdvRouterAddr off;
	};
};
```

Make sure to specify the *prefix*, rather than the IP address, i.e.
`2001:917:a3ff:6007::/64` not, `2001:917:a3ff:6007:1234:5678:9871:ffa2`.

# Integrating with firewalld

For this, you will need a somewhat recent release of firewalld, if your IPv6
interface is separate to your IPv4 interface. See [this firewalld blog
post](https://firewalld.org/2020/04/intra-zone-forwarding) for more information.

## If you have separate IPv6 and IPv4 interfaces

If you have separate interfaces for IPv6 and IPv4, we can split out your
firewalld zones. This means we can grant different permissions for IPv6 and IPv4
traffic to the router host. This is especially useful if the IPv4 addresses are
not publicly routable, such as if behind a NAT.

To begin with, we need to determine which interfaces host which IP traffic:

```sh
ip a
```

Next, we need to set the appropriate firewall zone for each interface:

```sh
sudo firewall-cmd --permanent --zone=internal --add-interface=<IPv4 interface>
sudo firewall-cmd --permanent --zone=public --add-interface=<IPv6 interface>
sudo firewall-cmd --reload
```

Feel free to choose other zones here. These were simply chosen as a way to
minimise access on the IPv6 interface, whilst allowing the internal IPv4 network
greater access.

At this point, we have actually removed the ability to forward traffic across
these interfaces, and thus IPv6 connectivity will no longer work for hosts
behind this router host.

To allow IPv6 traffic to pass between these interfaces freely, we have to accept
traffic from authorised IPv6 addresses to jump to the IPv6 zone. We can do this
by running:

```sh
sudo firewall-cmd --permanent --zone=public --add-source=<IPv6 prefix>
sudo firewall-cmd --reload
```

Remember to use the IPv6 prefix rather than just the host's IP address, as we
want to allow traffic from all connected hosts to jump from the internal
interface to the external interface. Also remember to replace the public zone
with whichever zone you chose for the IPv6 interface.

This step is simply to allow traffic from all IPs under the specified prefix to
transmit via interfaces in the public zone. This is firewalld's solution to
[intra-zone forwarding](https://firewalld.org/2020/04/intra-zone-forwarding).

Now continue on to the next step to allow the zone to forward the traffic.

## Allowing forwarding traffic

Regardless of whether you have separate interfaces or not, we need to allow the
traffic to be retransmitted to the router host's own gateway:

```sh
sudo firewall-cmd --permanent --zone=public --add-forward
sudo firewall-cmd --reload
```

# Testing your setup

We should now be able to ping an IPv6 address from a host behind the router:

```sh
ping 2600::
```

If not, we can try troubleshooting.

## Do internal hosts receive addresses?

To check if internal hosts have received IPv6 addresses, we can run:

```sh
ip -6 a
```

We want to look for an address that begins with the prefix we specified. I.e. if
we had the prefix `2001:917:a3ff:6007::/64`, we should expect to see an address
like `2001:917:a3ff:6007:1234:5678:9871:ffa2` listed.

If you do *not* see a listed address, you probably want to run:

```sh
sudo radvdump
```

On one of the hosts behind the router. This is available from the `radvd`
package we used earlier to send router-advertisements. You should see a prefix
being announced to these hosts. If not, double check you followed the steps in
[serving IPv6 router advertisements](#serving-ipv6-router-advertisements).


## I'm getting "Destination unreachable: Administratively prohibited" from ping

This indicates a problem with your firewall configuration. If you have two
interfaces (one for IPv6 and one for IPv4), double check that you have
configured the firewall zones as specified in [If you have separate IPv6 and
IPv4 interfaces](#if you have separate ipv6 and ipv4 interfaces). Specifically,
you should double-check that you have correctly added the source IPv6 prefix to
the correct **IPv6 interface's zone**, and added IP forwarding on that zone.
Also double-check you've reloaded the firewall after applying the permanent
changes.

Alternatively, if you only have a single interface, make sure that you've
[enabled-forwarding](#allowing-forwarding-traffic) and reloaded your firewall.

If none of these work, you can double check that it is a firewall issue, by
either disabling your firewall entirely, or by adding the prefix to the trusted
zone:

```sh
sudo firewall-cmd --zone=trusted --add-source=<IPv6 prefix>
```

This will temporarily (until you reload the firewall), add your prefix to the
trusted zone, which by default allows all connections and forwards
appropriately.
