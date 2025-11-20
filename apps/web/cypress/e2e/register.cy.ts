/// <reference types="cypress" />

describe("Register", () => {
  beforeEach(() => {
    cy.visit("/register");
    cy.get("[data-cy=email-input-error]").should("not.exist");
    cy.get("[data-cy=confirm-password-input-error]").should("not.exist");
    cy.get("[data-cy=email-name-error]").should("not.exist");
    cy.get("[data-cy=email-confirm-password-error]").should("not.exist");
  });

  it("should register a new user successfully", () => {
    const name = `testuser_${Date.now()}`;
    const email = `test_${Date.now()}@example.com`;
    const password = "TestPassword123!";

    cy.get("[data-cy=name-input]").type(name);
    cy.get("[data-cy=email-input]").type(email);
    cy.get("[data-cy=password-input]").type(password);
    cy.get("[data-cy=confirm-password-input]").type(password);
    cy.get("[data-cy=submit]").click();

    // Should redirect to dashboard or show success
    cy.url().should("include", "/dashboard");
  });

  it("should show error if email already exists", () => {
    const name = "existinguser";
    const email = "user@example.com"; // Use a known existing email
    const password = "TestPassword123!";

    cy.get("[data-cy=name-input]").type(name);
    cy.get("[data-cy=email-input]").type(email);
    cy.get("[data-cy=password-input]").type(password);
    cy.get("[data-cy=confirm-password-input]").type(password);
    cy.get("[data-cy=submit]").click();

    cy.get("[data-cy=email-input-error]").should("be.visible").and("not.be.empty");
  });

  it("should show error if passwords do not match", () => {
    cy.get("[data-cy=name-input]").type("user");
    cy.get("[data-cy=email-input]").type("user3@example.com");
    cy.get("[data-cy=password-input]").type("TestPassword123!");
    cy.get("[data-cy=confirm-password-input]").type("DifferentPassword!");
    cy.get("[data-cy=submit]").click();

    cy.get("[data-cy=confirm-password-input-error]").should("be.visible").and("not.be.empty");
  });
});
