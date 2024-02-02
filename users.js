const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render('login', {
        msg: 'Please Enter Your Email and Password',
        msg_type: 'error',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).render('login', {
        msg: 'Invalid Email or Password',
        msg_type: 'error',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).render('login', {
        msg: 'Invalid Email or Password',
        msg_type: 'error',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    res.cookie('susan', token, cookieOptions);
    res.status(200).redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render('signup', {
        msg: 'Email id already Taken',
        msg_type: 'error',
      });
    } else if (password !== confirm_password) {
      return res.render('signup', {
        msg: 'Password do not match',
        msg_type: 'error',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.render('signup', {
      msg: 'User Registered Successfully',
      msg_type: 'good',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.logout = async (req, res) => {
  res.cookie('susan', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect('/');
};
