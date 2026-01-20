const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role || !['USER', 'MANAGER'].includes(role)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User exists' });

    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Invalid input' });

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

module.exports = { register, login };