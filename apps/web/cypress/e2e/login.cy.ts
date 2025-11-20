describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should log in with valid credentials", () => {
    cy.get("[data-cy=email-input]").type("user@example.com");
    cy.get("[data-cy=password-input]").type("password");
    cy.get("[data-cy=submit]").click();
    cy.url().should("include", "/dashboard");
  });

  it("should show error with invalid credentials", () => {
    cy.get("[data-cy=email-input]").type("user@example.com");
    cy.get("[data-cy=password-input]").type("wrongpassword");
    cy.get("[data-cy=submit]").click();
    // Should show error toast or error message
    cy.get('li[data-sonner-toast][data-type="error"]').should("be.visible").and("contain.text", "Login failed");
    cy.get("[data-cy=password-input]").should("be.empty");
  });
});
