
# Advocating for 2FA

> Following Operation Trusted, the administration of the Sagittarius Quadrant once again called on our services.
> Indeed, the academy of Playdoyeurs, the forces of order of the UET, in turn asked us to look into their own methods of authentication.
> 
> These include a 2-factor authentication system, so they assume they're strong enough not to get humiliated the same way our embassy does. Can you prove them wrong?
> 
> The website is almost complete and is already accessible online. Your goal is to log in as an 'admin' on the platform.
> 
> The format of the flag is : `HACKDAY{...}`

---

## Discovery

First, we discover this page:
![](attachments/Web%20Challenge%20-%20Auth%20-%20main%20page.png)

We then perform a dirsearch on the website. We discover the following routes:
![](attachments/Web%20Challenge%20-%20Auth%20-%20dirb.png)

We don’t detect very many new paths. We observe however the presence of a robots.txt file that we will observe later.

With the extension Wappalyzer, we discover the different technologies used:
![](attachments/Web%20Challenge%20-%20Auth%20-%20Wappalyser.png)

We observe a NodeJS/Express backend server is present. In addition, we observe that the frontend was developed in VueJS. This framework has the particularity of generating Single Page Apps. This is why the routes don’t appear.

By opening the `robots.txt` file, we observe the presence of another file called `sitemap.txt` used for referencing the website:
![](attachments/Web%20Challenge%20-%20Auth%20-%20robottxt.png)

The `sitemap.txt` file contains the authentication routes:
![](attachments/Web%20Challenge%20-%20Auth%20-%20Sitemap.png)

<aside>
💡 All these steps were not necessary. A manual test of the urls would have found the login and register routes.

</aside>

---

## Connection and registration test with username `admin`

We try to log in with the admin user with a random password:
![](attachments/Web%20Challenge%20-%20Auth%20-%20try%20login%20admin.png)

It does not work.

When we try to brute force the admin password, we observe that a request limiting mechanism is in place :
![](attachments/Web%20Challenge%20-%20Auth%20-%20limit%20rating.png)

We then try to register with the username `admin` (or `Admin`, or `aDmin`…). We observe that each time, **the user `admin` already exists**. Note that the **username is not case sensitive.**
![](attachments/Web%20Challenge%20-%20Auth%20-%20login%20admin%202.png)

We will therefore try to create an account to see the behavior of the application.

---

## Understanding how authentication works

We register with a username called `usertest`:
![](attachments/Web%20Challenge%20-%20Auth%20-%20create%20account%20usertest.png)

When we register, we are redirected to the double authentication page: [http://localhost/8080/2fa](http://localhost/8080/2fa)
![](attachments/Web%20Challenge%20-%20Auth%20-%202fa.png)

We click on the 2FA instance generation button to generate our code and authenticate.

Once the correct double authentication code has been entered, we access the page: [http://localhost/8080/flag](http://localhost/8080/flag)
![](attachments/Web%20Challenge%20-%20Auth%20-%20flag%20page.png)

We have therefore discovered two other pages : 

- [http://localhost/8080/2fa](http://localhost/8080/2fa)
- [http://localhost/8080/flag](http://localhost/8080/flag)

When we access the page [http://localhost/8080/2fa](http://localhost/8080/2fa), we observe that a token is saved in our local storage:
![](attachments/Web%20Challenge%20-%20Auth%20-%202fa%20with%20inspect.png)

**Token :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJ0ZXN0IiwiaWF0IjoxNjc1OTUyODgyLCJleHAiOjE2NzU5NTMwNjJ9.AslAxX8flo_kVrhZTKbiUgHnmv5QZbbkfPE1xDdTCHg`

When we access the page [http://localhost/8080/flag](http://localhost/8080/flag), we observe that another token is saved in the local storage. This one is different from the first.
![](attachments/Web%20Challenge%20-%20Auth%20-%20flag%20page%20inspect.png)

**Token :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJ0ZXN0IiwiaWF0IjoxNjc1OTUzMDIzLCJleHAiOjE2NzYwMzk0MjN9.2DD0EM3W65IbXFNTyFfrqxKMWyYEYerC7vlr1HjE8n`

We see that the tokens are JWT tokens. Thus, we understand that the connection is made by verifying that the jwt token for 2FA corresponds to the double authentication code sent. We thus obtain another jwt token to access the page [http://localhost/8080/flag](http://localhost/8080/flag).

To log in as `admin`, we must:

- either get a `admin` token for the page [http://localhost/8080/flag](http://localhost/8080/flag) and then get the double authentication code of `admin`
- or get the `admin` token for the page [http://localhost/8080/flag](http://localhost/8080/flag)

---

## JWT token

When entering these two tokens on [https://jwt.io/](https://jwt.io/), we obtain:

**JWT token for [http://localhost/8080/2fa](http://localhost/8080/2fa)**
![](attachments/Web%20Challenge%20-%20Auth%20-%20jwt%202fa.png)

**JWT token for [http://localhost/8080/flag](http://localhost/8080/flag)**
![](attachments/Web%20Challenge%20-%20Auth%20-%20jwt%20flag.png)

We observe that in the data we have the `username` and two other fields :

- `exp` (expiration time): Time after which the JWT expires
- `iat` (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT

**The the expiration period of the tokens is:** (calculated with this website : [https://iuliacazan.ro/timestamps-diff/#demo](https://iuliacazan.ro/timestamps-diff/#demo))

- JWT token for [http://localhost/8080/2fa](http://localhost/8080/2fa) : 3 min
- JWT token for [http://localhost/8080/flag](http://localhost/8080/flag) : 24h

### Brute force the signature

We will try to brute force the secret used for signing with this script :

```python
# Brute force secret of JWT

import jwt, argparse;

# Get arguments
parser = argparse.ArgumentParser(description='Brute force the jwt secret')
parser.add_argument('token',  type=str, help='JWT token')
parser.add_argument('-w', type=str, help='path to wordlist file', default='./wordlist.txt')

args = parser.parse_args()

token, wordlist = args.token, args.w

# Brute force the secret
secret_decoded = False

with open(wordlist, 'r') as seckeys:
	for secret in seckeys:
		try:
			payload = jwt.decode(token, secret.rstrip(), algorithms=['HS256'], options={'verify_exp':False})
			print("Success. Token decoded with the following key: " + secret.rstrip())
			secret_decoded = True
			break
		except :
			continue

if not secret_decoded:
	print("The secret of the token has not been found")
```

**The wordlist is :** [https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list](https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list)

**The result is :** 

- JWT token for [http://localhost/8080/2fa](http://localhost/8080/2fa) :
![](attachments/Web%20Challenge%20-%20Auth%20-%20jwt%20bf%202fa.png)

- JWT token for [http://localhost/8080/flag](http://localhost/8080/flag) :
![](attachments/Web%20Challenge%20-%20Auth%20-%20jwt%20bf%20flag.png)

So we found the secret to sign the jwt token which gives us access to double authentication. It’s `YOUR_JWT_SECRET_HERE`

### Generate token for admin with good signature and time validity

With this script, we can generate a new token:

```python
# Generate JWT token

import jwt,sys, argparse, datetime, json;

# Get arguments
parser = argparse.ArgumentParser(description='Generate JWT token')
parser.add_argument('-p', required=True, type=str, help='Payload in JSON format')
parser.add_argument('-t', required=True, type=int, help='Validity time in second')
parser.add_argument('-s', required=True, type=str, help='Secret')

args = parser.parse_args()

payload, secret, validity_time = json.loads(args.p), args.s, args.t

timestamp_start = datetime.datetime.timestamp(datetime.datetime.now())
timestamp_end = timestamp_start + validity_time

payload['iat'] = timestamp_start
payload['exp'] = timestamp_end

print(payload)

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
```

We therefore generate a new token valid for 3 min for the `admin` username:
![](attachments/Web%20Challenge%20-%20Auth%20-%20genererate%20admin%20jwt.png)


**Token** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjc1OTU1MjEwLjU1MTc1MywiZXhwIjoxNjc1OTU1NTEwLjU1MTc1M30.XoljxeZ8Lf9xcPZ6sIueZduStIY-VzP3f3CFXmUXgQs`

When you connect with the username `usertest` and access the page [http://localhost/8080/2fa](http://localhost/8080/2fa), you can change the token to the token generated previously. When we update the page, we observe that the username has changed to `admin`:
![](attachments/Web%20Challenge%20-%20Auth%20-%202fa%20as%20admin.png)

As we can't get the admin token of the page [http://localhost/8080/flag](http://localhost/8080/flag), it is necessary to find a way to obtain the double authentication code from `admin`.

---

## Understand how TOTP work

Let's create a new user who is present in the majority of wordlists : `user`.

When we generate the double authentication code for this user, we observe that the qrcode redirects to this link: (we obtain that with [https://zxing.org/w/decode.jspx](https://zxing.org/w/decode.jspx))

`otpauth://totp/Web%20Challenge%20-%20Authentification%20%28user%29?secret=GBSDQZBVMNSDANRYGMZGEMRZGU3DANZUGVTGKNDFGFRDSNBRMNTA`

We observe that the double authentication code is generated by a secret. Here the secret is `GBSDQZBVMNSDANRYGMZGEMRZGU3DANZUGVTGKNDFGFRDSNBRMNTA`

With this website and the secret ([https://totp.danhersam.com/](https://totp.danhersam.com/)), we find the same secret that we would have found if we had scanned the qrcode with an application such as Google Authenticator.

You would need to get the secret from the `admin` user. We know that the type of double authentication is TOTP. TOTP secrets are always in base32 format.

**Let's decode then the secret of base32** (with this website):  `0d8d5cd06832b29560745fe4e1b941cf`

One can try to discover the format of this cipher with :
![](attachments/Web%20Challenge%20-%20Auth%20-%20check%20totp%20alg.png)

On peut donc essayer de decoder ce hash avec une attaque par rainbow table [https://www.dcode.fr/hash-md5](https://www.dcode.fr/hash-md5))

We obtaint : md5(`0d8d5cd06832b29560745fe4e1b941cf`)= `ee11cbb19052e40b07aac0ca060c23ee`

As the rainbow table attack worked, this means that this hash is already filled in. We can therefore try to redecode this hash with md5:

We obtaint : md5(`ee11cbb19052e40b07aac0ca060c23ee`)= `user`

We therefore understand that the TOTP secret is generated in the following way: `base32(md5(md5(SECRET)))`

### Generate a secret for admin

```python
# TOTP secret

from hashlib import md5
import base64, argparse

# Get arguments
parser = argparse.ArgumentParser(description='Get TOTP secret - base64(md5(md5()))')
parser.add_argument('encode', required=True, type=str, help='use this option to obtain TOTP key from username')

args = parser.parse_args()

to_encode = args.encode

print("To encode : ", to_encode)

encrypt1 = md5(to_encode.encode()).hexdigest().encode()
print("MD5 (1): ", encrypt1)

encrypt2 = md5(encrypt1).hexdigest().encode()
print("MD5 (2): ", encrypt2)

encrypt_base32 = base64.b32encode(encrypt2)
print("Base 32: ", encrypt_base32)
```

The secret for admin is:
![](attachments/Web%20Challenge%20-%20Auth%20-%20decode%20admin%20secret.png)

**TOTP secret :** `MMZTEOBUMQYGMOJUGYYDMZDFGFTGIMTBMYYTOMTBMJQTCNLCMYZQ====`

We can therefore generate the TOTP code of admin:
![](attachments/Web%20Challenge%20-%20Auth%20-%20get%20code%20of%20admin%202fa.png)

By exploiting the two vulnerabilities:

- Low secret JWT for [http://localhost/8080/flag](http://localhost/8080/flag)
- TOTP secret generated from username

We can therefore connect and obtain the following page:
![](attachments/Web%20Challenge%20-%20Auth%20-%20flag%20page%20as%20admin.png)

The flag is located in the content of the html page:
![](attachments/Web%20Challenge%20-%20Auth%20-%20final%20flag.png)

So, `SEFDS0RBWXtsMHdfand0X3MxZ25fQU5EX3QwdHBfYnlwNHNzM2R9` is base64.

The flag is therefore `HACKDAY{l0w_jwt_s1gn_AND_t0tp_byp4ss3d}`


---

M*ade by Pierrick Delrieu*