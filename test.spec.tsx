import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { mockEditor } from "../controls/editor-controls.spec";
import { editorPlaceholders } from "../mocked-data";
import { createEditorLabel } from "../utils/editor-create-label";

import { EditorPlaceholderButton } from "./editor-placeholder-button";

describe("test editor placeholder button component", () => {
  it("should render the button correctly", () => {
    const { getByRole } = render(
      <EditorPlaceholderButton editor={mockEditor()} />
    );
    const button = getByRole("button");
    expect(button).toBeInTheDocument();
  });
  it("should render labels correctly", async () => {
    const screen = render(
      <EditorPlaceholderButton
        placeholders={editorPlaceholders}
        editor={mockEditor()}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    const menuItems = screen.container.querySelectorAll(
      ".dropdown-select .dropdown-item"
    );
    expect(menuItems.length).toBe(Object.keys(editorPlaceholders).length);
    menuItems.forEach((item, index) => {
      expect(item).toHaveTextContent(
        `#${Object.values(editorPlaceholders)[index].text}${
          Object.values(editorPlaceholders)[index].description
        }`
      );
    });
  });
  describe("should call the editor hook", () => {
    for (const { id, text } of editorPlaceholders) {
      it(`placeholder ${text} works`, async () => {
        const editor = mockEditor();
        const screen = render(
          <EditorPlaceholderButton
            placeholders={editorPlaceholders}
            editor={editor}
          />
        );
        await waitFor(async () => {
          const button = screen.getByRole("button");
          expect(button).toBeInTheDocument();
          await userEvent.click(button);
          const menuItems = screen.getAllByTestId(`menu-item`);

          const item = menuItems.find((elm) =>
            elm.querySelector(`[data-test="item-${id}"]`)
          );
          expect(item).toBeDefined();
          if (!item) {
            return;
          }

          const labelContent = createEditorLabel(text, id);

          await userEvent.click(item);

          expect(editor.current.insertContent).lastCalledWith(
            `${labelContent} `
          );
          expect(editor.current.run).toBeCalled();
        });
      });
    }
  });
});
