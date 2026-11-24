document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // ELEMENTOS
    // =====================================

    const form = document.querySelector("#bookingForm");
    const serviceSelect = document.querySelector("#servico");
    const dateInput = document.querySelector("#data");
    const feedback = document.querySelector("#formFeedback");
    const submitButton = document.querySelector("#submitBooking");
    const requestsList = document.querySelector("#requestsList");
    const requestsCount = document.querySelector("#requestsCount");

    let solicitacoes = [];

    // =====================================
    // ANIMAÇÃO AO ROLAR A PÁGINA
    // =====================================

    const elementosAnimados = document.querySelectorAll(
        ".hero-home, .section-heading, .objective-card, " +
        ".service-card, .about-band, .page-hero, " +
        ".booking-form-card, .booking-aside, .cta-section"
    );

    elementosAnimados.forEach((elemento) => {
        elemento.classList.add("reveal");
    });

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observer.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.12
    });

    document.querySelectorAll(".reveal").forEach((elemento) => {
        observer.observe(elemento);
    });

    // =====================================
    // EFEITO DO MENU AO ROLAR
    // =====================================

    const navbar = document.querySelector(".navbar-belle");

    function atualizarNavbar() {
        if (!navbar) return;

        if (window.scrollY > 30) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", atualizarNavbar);
    atualizarNavbar();

    // =====================================
    // SELEÇÃO AUTOMÁTICA DO PROCEDIMENTO
    // =====================================

    document.querySelectorAll("[data-service]").forEach((link) => {
        link.addEventListener("click", () => {
            const servico = link.dataset.service;

            if (servico) {
                sessionStorage.setItem("belleChosenService", servico);
            }
        });
    });

    if (serviceSelect) {
        const servicoSalvo = sessionStorage.getItem("belleChosenService");

        if (servicoSalvo) {
            const opcaoExiste = Array.from(serviceSelect.options).some(
                (opcao) => opcao.value === servicoSalvo ||
                           opcao.textContent.trim() === servicoSalvo
            );

            if (opcaoExiste) {
                serviceSelect.value = servicoSalvo;
            }

            sessionStorage.removeItem("belleChosenService");
        }
    }

    // =====================================
    // DATA MÍNIMA: HOJE
    // =====================================

    if (dateInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        dateInput.min = `${ano}-${mes}-${dia}`;
    }

    // =====================================
    // FEEDBACK DO FORMULÁRIO
    // =====================================

    function mostrarFeedback(mensagem, tipo) {
        if (!feedback) return;

        feedback.className = `alert alert-${tipo}`;
        feedback.textContent = mensagem;
        feedback.classList.remove("d-none");
    }

    // =====================================
    // PAINEL DE SOLICITAÇÕES DA SESSÃO
    // =====================================

    function atualizarLista() {
        if (!requestsList || !requestsCount) return;

        requestsCount.textContent =
            `${solicitacoes.length} solicitação${solicitacoes.length !== 1 ? "ões" : ""}`;

        if (solicitacoes.length === 0) {
            requestsList.innerHTML = `
                <p class="empty-state">
                    As solicitações registradas nesta sessão aparecerão aqui.
                </p>
            `;
            return;
        }

        requestsList.innerHTML = "";

        solicitacoes.forEach((solicitacao) => {
            const item = document.createElement("div");
            item.className = "request-item";

            const informacoes = document.createElement("div");

            const nome = document.createElement("strong");
            nome.textContent = solicitacao.nome;

            const detalhes = document.createElement("small");
            detalhes.textContent =
                `${solicitacao.servico} • ${solicitacao.data} • ${solicitacao.horario}`;

            informacoes.append(nome, detalhes);
            item.appendChild(informacoes);

            requestsList.appendChild(item);
        });
    }

    atualizarLista();

    // =====================================
    // ENVIO DO FORMULÁRIO POR E-MAIL
    // =====================================

    if (form) {
        form.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const dados = new FormData(form);

            const solicitacao = {
                nome: dados.get("Nome"),
                email: dados.get("E-mail"),
                telefone: dados.get("Telefone"),
                servico: dados.get("Procedimento"),
                data: dados.get("Data desejada"),
                horario: dados.get("Período preferido"),
                mensagem: dados.get("Mensagem")
            };

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML =
                    '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';
            }

            try {
                const resposta = await fetch(form.action, {
                    method: "POST",
                    body: dados,
                    headers: {
                        "Accept": "application/json"
                    }
                });

                let resultado = {};

                try {
                    resultado = await resposta.json();
                } catch (erro) {
                    resultado = {};
                }

                if (!resposta.ok || resultado.success === "false" ||
                    resultado.success === false) {
                    throw new Error("O serviço não confirmou o recebimento.");
                }

                solicitacoes.push(solicitacao);
                atualizarLista();

                mostrarFeedback(
                    "Sua solicitação foi enviada! A Belle Clinic poderá entrar em contato para confirmar a disponibilidade.",
                    "success"
                );

                form.reset();

                if (dateInput) {
                    const hoje = new Date();
                    const ano = hoje.getFullYear();
                    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
                    const dia = String(hoje.getDate()).padStart(2, "0");

                    dateInput.min = `${ano}-${mes}-${dia}`;
                }

            } catch (erro) {
                console.error("Erro ao enviar formulário:", erro);

                mostrarFeedback(
                    "Não foi possível confirmar o envio. Verifique sua conexão e se o endereço da Belle Clinic já foi ativado no FormSubmit.",
                    "danger"
                );

            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML =
                        'Enviar solicitação <i class="bi bi-arrow-up-right"></i>';
                }
            }
        });
    }

}); 