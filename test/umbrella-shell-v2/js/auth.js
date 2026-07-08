// js/auth.js
window.AuthService = {
  async currentUser() {
    return Parse.User.currentAsync();
  },

  async logIn(username, password) {
    if (!username || !password) throw new Error("Missing credentials");
    return Parse.User.logIn(username, password);
  },

  async signUp({ username, password, email }) {
    if (!username || !password) throw new Error("Missing credentials");
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    if (email) user.set("email", email);

    // custom field for admin control
    user.set("isActive", true);

    return user.signUp();
  },

  async logOut() {
    return Parse.User.logOut();
  }
};