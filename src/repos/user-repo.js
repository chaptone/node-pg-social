const pool = require("../pool");
const toCamelCase = require("./utils/to-camal-case");

class UserRepo {
  static async find() {
    const { rows } = await pool.query("SELECT * FROM users;");

    return toCamelCase(rows);
  }

  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1;", [
      id,
    ]);

    return toCamelCase(rows)[0];
  }

  static async insert() {}

  static async update() {}
}

module.exports = UserRepo;
