import {
    escapeHtml,
} from "../utils/html.js";

export class AppearanceView {
    static render({ channels, statuses, projectConfig }) {
        const appearance = projectConfig.appearance;

        return `
            <details class="appearance-editor">
                <summary class="appearance-editor__summary">
                    Personalizar
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
                            ${statuses.map((status) => `
                                <label class="appearance-editor__color-field">
                                    <span>${escapeHtml(status.label)}</span>
                                    <input type="color"
                                        name="status-color-${status.value}"
                                        value="${appearance.statusColors[status.value]}"
                                        aria-label="Cor do status ${escapeHtml(status.label)}">
                                    <code>${appearance.statusColors[status.value]}</code>
                                </label>
                            `).join("")}

                            <div class="appearance-editor__new-item">
                                <label>
                                    <span>Novo status</span>
                                    <input type="text" name="new-status-label"
                                        maxlength="40" placeholder="Ex.: Bloqueada">
                                </label>
                                <label class="appearance-editor__color-field">
                                    <span>Cor inicial</span>
                                    <input type="color" name="new-status-color"
                                        value="#64748B" aria-label="Cor do novo status">
                                </label>
                            </div>
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
                                    <div class="appearance-editor__channel-preview">
                                        ${channel.logoPath
                                            ? `<img src="${channel.logoPath}" alt="" aria-hidden="true">`
                                            : `<strong>${escapeHtml(channel.shortLabel)}</strong>`}
                                    </div>

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

                            <div class="appearance-editor__channel-row appearance-editor__channel-row--new">
                                <div class="appearance-editor__channel-preview" aria-hidden="true">+</div>
                                <label>
                                    <span>Novo canal</span>
                                    <input type="text" name="new-channel-label"
                                        maxlength="60" placeholder="Nome completo">
                                </label>
                                <label>
                                    <span>Etiqueta</span>
                                    <input type="text" name="new-channel-short-label"
                                        maxlength="20" placeholder="Ex.: TEGRA">
                                </label>
                                <label class="appearance-editor__color-field">
                                    <span>Cor inicial</span>
                                    <input type="color" name="new-channel-color"
                                        value="#64748B" aria-label="Cor do novo canal">
                                </label>
                            </div>
                        </div>
                    </section>

                    <div class="appearance-editor__actions">
                        <button class="modal-button modal-button--primary" type="submit">
                            Salvar personalização
                        </button>
                    </div>
                </form>
            </details>
        `;
    }

}
