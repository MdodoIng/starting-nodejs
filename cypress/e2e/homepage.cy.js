describe("LAN Share homepage", () => {
  it("loads and shows the title", () => {
    cy.visit("/");
    cy.contains("LAN Share").should("be.visible");
  });
});
