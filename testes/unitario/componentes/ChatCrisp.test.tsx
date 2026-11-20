import { render } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { ChatCrisp } from "@/componentes/interface/ChatCrisp";

describe("ChatCrisp", () => {
  beforeEach(() => {
    document.getElementById("script-widget-crisp")?.remove();
    window.$crisp = [];
    delete window.CRISP_WEBSITE_ID;
  });

  it("injeta o script oficial do Crisp com o Website ID e exibe o widget", () => {
    const { unmount } = render(
      <ChatCrisp emailUsuario="cliente@exemplo.com.br" nomeUsuario="Studio A" />,
    );

    expect(window.CRISP_WEBSITE_ID).toBe("294e744c-e84e-4664-a2e2-3f2e764467d6");

    const script = document.getElementById("script-widget-crisp") as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toBe("https://client.crisp.chat/l.js");

    expect(window.$crisp).toContainEqual(["set", "user:email", ["cliente@exemplo.com.br"]]);
    expect(window.$crisp).toContainEqual(["set", "user:nickname", ["Studio A"]]);
    expect(window.$crisp).toContainEqual(["do", "chat:show"]);

    unmount();
    expect(window.$crisp).toContainEqual(["do", "chat:hide"]);
  });

  it("não duplica a tag de script se o componente for montado novamente", () => {
    const primeiraMontagem = render(<ChatCrisp />);
    primeiraMontagem.unmount();

    render(<ChatCrisp />);
    const scripts = document.querySelectorAll("#script-widget-crisp");
    expect(scripts.length).toBe(1);
  });
});

