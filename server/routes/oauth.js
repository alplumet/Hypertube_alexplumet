const express = require("express");
const request = require("request");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const { User } = require("../models/User");
const router = express.Router();

function send_mail(strategy, username, email, password) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "hypertube.jcreux@gmail.com",
			pass: "Hypertube42?@"
		}
	});
	const mailOptions = {
		from: "Hypertube",
		to: email,
		subject: "Informations Hypertube",
		html: `<h3>Bonjour ` + username + `,</h3><br/>
		<p>Après votre connexion à Hypertube via ` + strategy + `, nous vous avons généré un mot de passe provisoire.<br/> Pensez à le changer une fois connecté !<br/></p>
		<p>Voici votre mot de passe : ` + password + `</p><br/>
		<p>Merci de conserver ce mail au moins tant que vous n'avez pas votre propre mot de passe.</p>
		<p>Bonne journée !</p>`
	};
	transporter.sendMail(mailOptions);
}

function genPassword() {
	let password = randomstring.generate(12);

	password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/g) ? check_password = 0 : check_password = 1;
	while (check_password === 1) {
		password = randomstring.generate(12);
		password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/g) ? check_password = 0 : check_password = 1;
	}
	return (password);
}

router.get("/42", (req, res) => {
	request.post({
		url: "https://api.intra.42.fr/oauth/token",
		json: true,
		form: {
			grant_type: "authorization_code",
			client_id: "3acbb925116e89ed915f500bab013925f8a18d6886c590c0110a93cc29bc9d38",
			client_secret: "f6918e27bdb3586738c930c770f2d5fcc64ee84fdd702109a1eddb64512b7043",
			code: req.query.code,
			redirect_uri: "http://localhost:3000/api/oauth/42"
		}
	}, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return (res.status(400).send(err));
		} else {
			request.get({
				url: "https://api.intra.42.fr/v2/me",
				json: true,
				form: {
					access_token: body.access_token
				}
			}, function optionalCallback(err, httpResponse, body) {
				if (err) {
					return (res.status(400).send(err));
				} else {
					User.findOne({"id_42": body.id}, (err, user) => {
						if (err) {
							return (res.status(400).send(err));
						} else if (user === null) {
							User.find({
								$or : [{"username" : body.login}, {"email" : body.email}]
							}, (err, user) => {
								if (err) {
									return (res.status(400).send(err));
								} else if (user.length === 0) {
									let password = genPassword();
									let infos = {
										email: body.email,
										password: password,
										username: body.login,
										firstName: body.first_name,
										lastName: body.last_name,
										image: body.image_url,
										token_mail: true,
										id_42: body.id
									}
									const user = new User(infos);

									send_mail("42", body.login, body.email, password);
									user.generateToken((err, user) => {
										if (err) {
											return (res.status(400).send(err));
										} else {
											res.cookie("w_authExp", user.tokenExp);
											res.cookie("w_auth", user.token).status(200);
											res.redirect("/landing");
										}
									});
								} else {
									return (res.send("Email or username already used !"));
								}
							});
						} else {
							user.generateToken((err, user) => {
								if (err) {
									return (res.status(400).send(err));
								} else {
									res.cookie("w_authExp", user.tokenExp);
									res.cookie("w_auth", user.token).status(200);
									res.redirect("/landing");
								}
							});
						}
					});
				}
			});
		}
	});
});

function getPrivateEmail(res, access_token, login, avatar_url, id) {
	request.get({
		url: "https://api.github.com/user/emails",
		json: true,
		headers: {
			"user-agent": "request",
			"Authorization": "token " + access_token
		}
	}, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return (res.status(400).send(err));
		} else {
			User.findOne({"id_github": id}, (err, user) => {
				if (err) {
					return (res.status(400).send(err));
				} else if (user === null) {
					User.find({
						$or : [{"username" : login}, {"email" : body[0].email}]
					}, (err, user) => {
						if (err) {
							return (res.status(400).send(err));
						} else if (user.length === 0) {
							let password = genPassword();
							let infos = {
								email: body[0].email,
								password: password,
								username: login,
								firstName: null,
								lastName: null,
								image: avatar_url,
								token_mail: true,
								id_github: id
							}
							const user = new User(infos);

							send_mail("Github", login, body[0].email, password);
							user.generateToken((err, user) => {
								if (err) {
									return (res.status(400).send(err));
								} else {
									res.cookie("w_authExp", user.tokenExp);
									res.cookie("w_auth", user.token).status(200);
									res.redirect("/landing");
								}
							});
						} else {
							return (res.send("Email or username already used !"));
						}
					});
				} else {
					user.generateToken((err, user) => {
						if (err) {
							return (res.status(400).send(err));
						} else {
							res.cookie("w_authExp", user.tokenExp);
							res.cookie("w_auth", user.token).status(200);
							res.redirect("/landing");
						}
					});
				}
			});
		}
	});
}

router.get("/github", (req, res) => {
	request.post({
		url: "https://github.com/login/oauth/access_token",
		json: true,
		form: {
			client_id: "ce56b74597442ae00277",
			client_secret: "6cff1204c2146635a8da7e9318428de0d6a2771e",
			code: req.query.code
		}
	}, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return (res.status(400).send(err));
		} else {
			let access_token = body.access_token;

			request.get({
				url: "https://api.github.com/user",
				json: true,
				headers: {
					"user-agent": "request",
					"Authorization": "token " + access_token
				}
			}, function optionalCallback(err, httpResponse, body) {
				if (err) {
					return (res.status(400).send(err));
				} else {
					getPrivateEmail(res, access_token, body.login, body.avatar_url, body.id);
				}
			});
		}
	});
});

router.get("/discord", (req, res) => {
	request.post({
		url: "https://discord.com/api/oauth2/token",
		json: true,
		form: {
			grant_type: "authorization_code",
			client_id: "712235304152727663",
			client_secret: "SRK9W-X-akjgmpwJtYgZy3vFlpRM5Wmp",
			code: req.query.code,
			redirect_uri: "http://localhost:3000/api/oauth/discord",
			scope: "identify email"
		}
	}, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return (res.status(400).send(err));
		} else {
			request.get({
				url: "https://discordapp.com/api/v6/users/@me",
				json: true,
				headers: {
					authorization: "Bearer " + body.access_token
				}
			}, function optionalCallback(err, httpResponse, body) {
				if (err) {
					return (res.status(400).send(err));
				} else {
					User.findOne({"id_discord": body.id}, (err, user) => {
						if (err) {
							return (res.status(400).send(err));
						} else if (user === null) {
							User.find({
								$or : [{"username" : body.username}, {"email" : body.email}]
							}, (err, user) => {
								if (err) {
									return (res.status(400).send(err));
								} else if (user.length === 0) {
									let password = genPassword();
									if (body.avatar === null) {
										var avatar = "https://entballarat.com.au/wp-content/uploads/2018/11/blank-male.jpg";
									} else {
										var avatar = "https://cdn.discordapp.com/avatars/" + body.id + "/" + body.avatar;
									}
									let infos = {
										email: body.email,
										password: password,
										username: body.username,
										firstName: null,
										lastName: null,
										image: avatar,
										token_mail: true,
										id_discord: body.id
									}
									const user = new User(infos);

									send_mail("Discord", body.username, body.email, password);
									user.generateToken((err, user) => {
										if (err) {
											return (res.status(400).send(err));
										} else {
											res.cookie("w_authExp", user.tokenExp);
											res.cookie("w_auth", user.token).status(200);
											res.redirect("/landing");
										}
									});
								} else {
									return (res.send("Email or username already used !"));
								}
							});
						} else {
							user.generateToken((err, user) => {
								if (err) {
									return (res.status(400).send(err));
								} else {
									res.cookie("w_authExp", user.tokenExp);
									res.cookie("w_auth", user.token).status(200);
									res.redirect("/landing");
								}
							});
						}
					});
				}
			});
		}
	});
});

module.exports = router;