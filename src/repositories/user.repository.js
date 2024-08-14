const UserModel = require("../models/user.model.js");

class UserRepository {
  async createUser(userData) {
    try {
      const newUser = new UserModel(userData);
      await newUser.save();
      return newUser;
    } catch (error) {
      throw new Error("Error al crear usuario en la base de datos");
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw new Error("Error al encontrar usuario por email");
    }
  }

  async findById(id) {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  async getAllUsers() {
    const users = await UserModel.find();
    return users.map(user => user.toObject());
  }


  async deleteUser(uid) {
      try {
          await UserModel.findByIdAndDelete(uid);
      } catch (error) {
          throw new Error("Error al eliminar el usuario");
      }
  }

  async deleteInactiveUsers(inactivityThreshold) {
    try {
        // Eliminar usuarios inactivos directamente
        const result = await UserModel.deleteMany({ last_connection: { $lt: inactivityThreshold } });

        // Obtener el número de eliminaciones
        const deletedCount = result.deletedCount;

        // Si necesitas los usuarios eliminados, puedes hacer una búsqueda
        const deletedUsers = await UserModel.find({ last_connection: { $lt: inactivityThreshold } });

        return { deletedCount, deletedUsers };
    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error);
        throw error;
    }
}
 
  async deleteUserById(userId) {
    try {
      const result = await UserModel.findByIdAndDelete(userId);
      if (!result) {
        throw new Error("Usuario no encontrado");
      }
    } catch (error) {
      throw new Error("Error al eliminar el usuario");
    }
  }
}

module.exports = UserRepository;

