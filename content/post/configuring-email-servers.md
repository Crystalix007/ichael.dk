+++
date = 2020-07-22T19:36:31+01:00
title = "Configuring E-Mail Servers"
author = "Michael Kuc"
description = "What you need to know about hosting your own mail server"

[taxonomies]
tags = [
	"hosting",
	"email",
	"dkim",
	"ssl",
	"mx",
	"imap",
	"pop3",
]

categories = [
	"Email",
	"Hosting",
]
+++

Mail hosting is a complex world of ongoing arms-races between the people who
send spam emails and the companies providing email who want to block those
emails. Therefore, there have been quite a few complexities added over the years
to secure and verify that email is tied to the correct source, and spam email
can be blocked easily.

This guide is targeted towards those who don't have experience setting up their
own email server, but even those that do have some experience may find it useful
to use this guide as a reference to do further research.

# MX Records

> MX records are [a DNS record][dns record] used to specify the address of a
> mail server for a particular domain.

MX records are the backbone of how an email server receives mail. When someone
mails to an address `@address.com`, that `address.com` will be be queried by
your email provider in order to find where the mail should be delivered to.

Similarly, if you own the domain `my.domain.tld`, then anyone trying to send and
email to `user@my.domain.tld` will need to query the [IP address][ip address] of
your mail server. In order for their mail to reach you, you need to add the
address of the computer running your mail server to the [DNS records][dns
record] of your domain. These settings should probably be available from the
[domain registrar][domain registrar] you bought your domain from. If you have
transferred your domain to a different registrar / entity (such as
[Cloudflare][cloudflare]), then try looking there first.

The way the MX record is typically set up is:

```
MX my.domain.tld my.email.server.domain.tld
```

Therefore, the server you are running this on needs a subdomain.

## How to host your website on the same server

If you want to host the email server on the same computer running the website /
other functionality of your domain, then you can specify that they are the same:

```
MX my.domain.tld my.domain.tld
```

In order for this to resolve correctly, you need the domain you chose for the
email server to resolve to the same IP address as your email server. Otherwise,
almost all email providers will silently dump your email in the spam folder, to
avoid spam. An important result is that you cannot use Cloudflare on any other
CDN on that subdomain, as then the IP address will resolve to their CDN servers,
not your email server.

This is not to say you cannot use a CDN, just that if you do use it, it must be
on a different subdomain. For example, you could have `www.domain.tld` protected
with a CDN, and leave `domain.tld` to resolve to the raw IP address of the mail
server if you intend to send email from addresses like `user@domain.tld`.

# PTR Record / Reverse DNS

> The PTR record is a DNS record owned by the entity in control of the IP
> address your mail server is hosted on.

Another way that email servers detect if email traffic is spam is by doing
[a reverse IP lookup][reverse dns], where basically, the IP address is looked up
to find the corresponding domain name. For example:

`10.90.108.16 -> a.local.domain`

Consequently, when before I said that the email server can be hosted on a
subdomain: `subdomain.domain.tld`, this requires that the reverse IP of the
server is set so: `my.email.ip.address -> subdomain.domain.tld`. This can
typically be set on the hosting provider's control panel if you are using a
server hosting provider.

Since this might interfere with your existing configuration for your website,
you can always host in on your main domain, but double check specifically [how
this will impact your CDN setup](#how-to-host-your-website-on-the-same-server)
before starting.

# Choosing an email server

For the lowest setup, if you have a fresh installation, take a look at
[mailinabox][mailinabox].

Alternatively, if you need a flashy web interface (you probably don't), take a
look at [iRedMail][iredmail]. This requires drastically more memory, and must
also be installed on a fresh installation.

My preferred option: go for [Postfix][postfix] and [Dovecot][dovecot], two open
source servers which work together to provide a usable email installation. This
doesn't use too much memory, and doesn't use a web interface, so you can host a
website more easily without using a [reverse proxy][reverse proxy].

# Encryption

To decrease the chance of interception and modification, email servers these
days typically use TLS encryption. This protects the emails whilst they travel
between the email servers (i.e. between your email server and Google or Apple).

In order to perform the TLS encryption, your email server needs to have a
certificate. The easiest way to obtain a certificate is to apply for one
automatically via [let's encrypt][letsencrypt]. This certificate is free, and
sufficient for typical email servers. Other certificate providers claim to
provide greater security if you are willing to pay, but you the decision is
yours.

You will want to apply for a certificate for the domain of the email server you
are sending from, i.e.:

```
my.email.server.domain.tld
```

or, if you are using the same server you are hosting your domain on:

```
my.domain.tld
```

## Postfix settings

If you are using Postfix, the necessary settings to configure the encryption are
like. Some of these are configurable to increase security at the expense of
compatibility with other mail servers. Conversely, if you want to permit older
mail servers to connect to your server, or mail servers with lesser security,
then you can tame down what security options are available.

```bash
# Outgoing mail
smtp_tls_cert_file = /etc/letsencrypt/live/my.domain.tld/fullchain.pem
smtp_tls_key_file = /etc/letsencrypt/live/my.domain.tld/privkey.pem
smtp_tls_mandatory_protocols = !SSLv2,!SSLv3,!TLSv1,!TLSv1.1
smtp_tls_note_starttls_offer = yes
smtp_tls_protocols = !SSLv2,!SSLv3,!TLSv1,!TLSv1.1
smtp_tls_security_level = may
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache
smtp_use_tls = yes

# Incoming mail
smtpd_tls_cert_file = /etc/letsencrypt/live/my.domain.tld/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/my.domain.tld/privkey.pem
smtpd_tls_loglevel = 1
smtpd_tls_mandatory_protocols = !SSLv2,!SSLv3,!TLSv1,!TLSv1.1
smtpd_tls_protocols = !SSLv2,!SSLv3,!TLSv1,!TLSv1.1
smtpd_tls_received_header = yes
smtpd_tls_security_level = may
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtpd_use_tls = yes

# Set random TLS encryption
tls_random_source = dev:/dev/urandom
```

# Accessing your mail

In order to access your mail, you can check using the conventional UNIX mail
clients. For example, [GNU mail][gnu mail], can be used to check you local UNIX
mail directory.

Once this is working, you can then setup the server for accessing emails from
other devices. This can either be a webmail interface, or, what I would
recommend: an IMAP / POP3 server. This allows you to access from any
conventional mail client, such as Thunderbird, or K9 on Android.

You can setup [Dovecot][dovecot] as an IMAP / POP3 server, which then provides
the authentication to [Postfix][postfix]. [Dovecot's][dovecot] settings will
look like:

```
protocols = "imap pop3"
service auth {
  unix_listener /var/spool/postfix/private/auth {
    group = postfix
    mode = 0666
    user = postfix
  }
}
```

Then, you can use this authentication source at
`/var/spool/postfix/private/auth` in [Postfix][postfix]:

```bash
smtpd_sasl_auth_enable = yes
smtpd_sasl_local_domain = $myhostname
smtpd_sasl_path = private/auth
smtpd_sasl_security_options = noanonymous
smtpd_sasl_type = dovecot
```

This `private/auth` refers to the path specified in the [Dovecot][dovecot]
configuration.

# OpenDKIM

> [DKIM][dkim] is a technology used to sign emails for authenticity.

[DKIM][dkim] allows email servers to prove that the emails being transmitted are
being done so under the authority of the email server. This relies on some
co-operation between the DNS records and email server. By specifying a signature
in a DNS record, any emails received can have their signature checked versus the
DNS record. If the signature matches, then email providers can better trust that
the person who owns the domain is actually forwarding the email.

This is possible on personal servers by configuring [OpenDKIM][opendkim].
[OpenDKIM][opendkim] can be configured to run as filter during the processing of
emails in [Postfix][postfix]:

```bash
non_smtpd_milters = local:opendkim/opendkim.sock

smtpd_milters = local:opendkim/opendkim.sock
```

With [OpenDKIM][opendkim] configuration:

```
Socket local:/var/spool/postfix/opendkim/opendkim.sock
```

This will increase the probability that the emails sent will be accepted on
other mail servers, due to the extra trust this can bring. Since DKIM is a
difficult thing to test on your own, you can try [Mail Tester][mail tester].
This involves sending an email to a temporary address, and their servers
scanning the DKIM record to check if it is valid (among other things).

[dns record]: https://www.cloudflare.com/en-gb/learning/dns/dns-records/
[ip address]: https://en.wikipedia.org/wiki/IP_address
[domain registrar]: https://www.cloudflare.com/en-gb/learning/dns/glossary/what-is-a-domain-name-registrar/
[cloudflare]: https://www.cloudflare.com/
[reverse dns]: https://www.cloudflare.com/en-gb/learning/dns/glossary/reverse-dns/
[mailinabox]: https://mailinabox.email/
[iredmail]: https://docs.iredmail.org/iredmail-easy.getting.start.html
[postfix]: http://www.postfix.org/BASIC_CONFIGURATION_README.html
[dovecot]: https://www.dovecot.org/
[reverse proxy]: https://www.cloudflare.com/en-gb/learning/cdn/glossary/reverse-proxy/
[letsencrypt]: https://letsencrypt.org/
[gnu mail]: http://mailutils.org/manual/html_section/mail.html
[dkim]: http://www.dkim.org/
[opendkim]: http://opendkim.org/
[mail tester]: https://www.mail-tester.com/
