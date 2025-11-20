Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: "/api/auth/sign-in/email",
    body: {
      email: "user@example.com",
      password: "password",
    },
  }).then((resp) => {
    expect(resp.status).to.eq(200);
  });
});

export {};
