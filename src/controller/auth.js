const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.register = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      email,
      hash_password,
      username: shortid.generate(),
    });

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (user) {
        const token = generateJwtToken(user._id, user.roles);
        const { _id, email, roles } = user;
        return res.status(201).json({
          token,
          user: { _id, email, roles },
        });
      }
    });
  });
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword && user.roles === "user") {
        // const token = jwt.sign(
        //   { _id: user._id, roles: user.roles },
        //   process.env.JWT_SECRET,
        //   {
        //     expiresIn: "10h",
        //   }
        // );
        const token = generateJwtToken(user._id, user.roles);
        const { _id, email, roles } = user;
        res.status(200).json({
          token,
          user: {
            _id,
            email,
            roles,
          },
        });
      } else {
        return res.status(400).json({
          message: "Tài khoản hoặc mật khẩu không hợp lệ",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};