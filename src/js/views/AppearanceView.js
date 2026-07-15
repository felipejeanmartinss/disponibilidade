import {
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    escapeHtml,
} from "../utils/html.js";

export class AppearanceView {
    static render({ channels, projectConfig }) {
        const appearance = projectConfig.appearance;

        return `
            <details class="appearance-editor">
                <summary class="appearance-editor__summary">
                    Personalizar aparência
                </summary>

                <form class="appearance-editor__form" data-appearance-form>
                    <section class="appearance-editor__section">
                        <div>
                            <h3>Estados comerciais</h3>
                            <p>
                                Escolha a cor dos cards e da legenda. O texto se ajusta
                                automaticamente para manter o contraste.
                            </p>
                        </div>

                        <div class="appearance-editor__status-grid">
                            ${UNIT_STATUS_OPTIONS.map((status) => `
                                <label class="appearance-editor__color-field">
                                    <span>${status.label}</span>
                                    <input type="color"
                                        name="status-color-${status.value}"
                                        value="${appearance.statusColors[status.value]}"
                                        aria-label="Cor do status ${status.label}">
                                    <code>${appearance.statusColors[status.value]}</code>
                                </label>
                            `).join("")}
                        </div>
                    </section>

                    <section class="appearance-editor__section">
                        <div>
                            <h3>Canais de vendas</h3>
                            <p>
                                Personalize o nome completo, a etiqueta curta e a cor
                                de identificação de cada canal.
                            </p>
                        </div>

                        <div class="appearance-editor__channel-grid">
                            ${channels.map((channel) => `
                                <div class="appearance-editor__channel-row">
                                    <img src="${channel.logoPath}" alt="" aria-hidden="true">

                                    <label>
                                        <span>Nome completo</span>
                                        <input type="text"
                                            name="channel-label-${channel.value}"
                                            maxlength="60"
                                            value="${escapeHtml(channel.label)}"
                                            required>
                                    </label>

                                    <label>
                                        <span>Etiqueta</span>
                                        <input type="text"
                                            name="channel-short-label-${channel.value}"
                                            maxlength="20"
                                            value="${escapeHtml(channel.shortLabel)}"
                                            required>
                                    </label>

                                    <label class="appearance-editor__color-field">
                                        <span>Cor RGB</span>
                                        <input type="color"
                                            name="channel-color-${channel.value}"
                                            value="${appearance.channelColors[channel.value]}"
                                            aria-label="Cor do canal ${escapeHtml(channel.label)}">
                                        <code>${appearance.channelColors[channel.value]}</code>
                                    </label>
                                </div>
                            `).join("")}
                        </div>
                    </section>

                    <div class="appearance-editor__actions">
                        <button class="modal-button modal-button--primary" type="submit">
                            Salvar aparência
                        </button>
                    </div>
                </form>
            </details>
        `;
    }

}
