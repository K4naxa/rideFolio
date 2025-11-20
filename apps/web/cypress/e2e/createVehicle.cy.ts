/// <reference types="cypress" />
describe("Vehicle Creation Modal", function () {
  beforeEach(function () {
    cy.login();
    cy.visit("/dashboard");
  });

  // -------------------------------------------------
  // Required Validation Test
  // -------------------------------------------------
  it("validates required fields", () => {
    cy.get('[data-cy="create-vehicle-button"]').click();
    cy.contains("Create new vehicle").should("be.visible");
    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy="name-error"]').should("be.visible").and("not.be.empty");
    cy.get('[data-cy="type-error"]').should("be.visible").and("not.be.empty");
    cy.get('[data-cy="odometer-type-error"]').should("be.visible").and("not.be.empty");
    cy.get('[data-cy="fuel-type-error"]').should("be.visible").and("not.be.empty");
  });

  // -------------------------------------------------
  // VIN Validation
  // -------------------------------------------------
  it("validates VIN length (17 chars)", () => {
    cy.get('[data-cy="create-vehicle-button"]').click();
    cy.contains("Create new vehicle").should("be.visible");
    cy.get('[data-cy="vin"]').type("12345");
    cy.get('[data-cy="submit"]').click();
    cy.get('[data-cy="vin-error"]').should("be.visible").and("not.be.empty");
  });

  // -------------------------------------------------
  // Full Valid Vehicle Creation
  // -------------------------------------------------
  it("creates a vehicle successfully", function () {
    cy.get('[data-cy="create-vehicle-button"]').click();
    cy.contains("Create new vehicle").should("be.visible");
    // Required Fields
    cy.get('[data-cy="name"]').type("My Hybrid Car");

    cy.get('[data-cy="type-trigger"]').click();
    cy.get('[data-cy="type-car-select"]').click();

    cy.get('[data-cy="odometer-type-trigger"]').click();
    cy.get('[data-cy="odometer-type-KILOMETER-select"]').click();

    cy.get('[data-cy="fuel-type-trigger"]').click();
    cy.get('[data-cy="fuel-type-HYBRID-select"]').click();

    // Optional Fields
    cy.get('[data-cy="make"]').type("Toyota");
    cy.get('[data-cy="model"]').type("Prius");
    cy.get('[data-cy="year"]').type("2021");
    cy.get('[data-cy="odometer"]').type("65000");
    cy.get('[data-cy="vin"]').type("1HGCM82633A123456");
    cy.get('[data-cy="license-plate"]').type("PR12345");

    // Submit
    cy.get('[data-cy="submit"]').click();

    // Wait for redirect and extract vehicleId from URL
    cy.url()
      .should("match", /\/vehicles\/([\w-]+)/)
      .then((url) => {
        const match = url.match(/\/vehicles\/([\w-]+)/);
        const vehicleId = match ? match[1] : undefined;
        expect(vehicleId).to.exist;
        this.vehicleId = vehicleId;
      });
  });
  // -------------------------------------------------
  // Vehicle Deletion Test
  // -------------------------------------------------
  it("deletes a vehicle via VehicleHero", function () {
    const vehicleId = this.vehicleId;
    expect(vehicleId).to.exist;
    cy.visit(`/vehicles/${vehicleId}`);
    cy.get('[data-cy="vehicle-hero"]').should("exist");
    cy.get('[data-cy="actions-trigger"], [aria-label="vehicle Actions"]').first().click({ force: true });
    cy.get('[data-cy="delete-vehicle-btn"]').click({ force: true });
    cy.get('[data-cy="action"]').click();
    cy.url().should("include", "/dashboard");
    // Optionally, check for a success message or that the vehicle is no longer listed
  });
});
