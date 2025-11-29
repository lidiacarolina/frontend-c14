// Configuração da API
const API_URL = 'http://localhost:8081';

// Estado da aplicação
let currentUser = null;
let currentProjetoId = null;
let currentTab = 'orientacoes';
let adminCurrentTab = 'dashboard';

    // Funções de Login
document.addEventListener('DOMContentLoaded', function() {
    // Funções de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginSenha').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (data.erro) {
                    showAlert('loginAlert', data.erro, 'error');
                    return;
                }

                currentUser = data;
                console.log(currentUser);
                showScreen(data.tipoUsuario.toLowerCase());
                loadUserData();
            } catch (error) {
                showAlert('loginAlert', 'Erro ao fazer login', 'error');
            }
        });
    }

function showAlert(containerId, message, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

function showScreen(screen) {
    // Oculta todas as telas
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
    });

    // Logout
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', () => {
            currentUser = null;
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginSenha').value = '';
            showScreen('login');
        });
    });
    
    // Mostra apenas a tela desejada
    if (screen === 'aluno') {
        document.getElementById('alunoScreen').style.display = 'block';
    } else if (screen === 'professor') {
        document.getElementById('professorScreen').style.display = 'block';
    } else if (screen === 'admin') {
        document.getElementById('adminScreen').style.display = 'block';
    } else {
        document.getElementById('loginScreen').style.display = 'block';
    }
}
});
// Funções do Aluno
async function loadUserData() {
    if (currentUser.tipoUsuario === 'aluno') {
        loadAlunoData();
    } else if (currentUser.tipoUsuario === 'professor') {
        loadProfessorData();
    } else if (currentUser.tipoUsuario === 'admin') {
        loadAdminData();
    }
}

async function loadAlunoData() {
    document.getElementById('alunoNome').textContent = currentUser.usuario.nome;

    try {
        const response = await fetch(`${API_URL}/alunos/${currentUser.usuario.matricula}`);
        const responseData = await response.json()
        // console.log(responseData);
        if (response.status === 400 || response.status === 200 && !responseData.projeto) {
            // Aluno não tem projeto
            document.getElementById('alunoContent').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <h3>Você ainda não está em nenhum projeto</h3>
                    <p>Crie um novo projeto para começar seu TCC</p>
                    <button class="btn btn-primary" onclick="openModal('modalCriarProjeto')" style="margin-top: 20px;">
                        Criar Novo Projeto
                    </button>
                </div>
            `;
        } else {
            const projectResponse = await fetch(`${API_URL}/projetos/${responseData.projeto.id}`);
            const project = await projectResponse.json();

            displayAlunoProjeto(project);
            // console.log(project);
        }
    } catch (error) {
        // console.log(error)
        showAlert('alunoAlert', 'Erro ao carregar dados', 'error');
    }
}

function displayAlunoProjeto(projeto) {
    const status = projeto.nota ? 
        (projeto.nota >= 6 ? 'Aprovado' : 'Reprovado') : 
        'Em andamento';
    
    const badgeClass = projeto.nota ? 
        (projeto.nota >= 6 ? 'badge-approved' : 'badge-rejected') : 
        'badge-pending';

    if (!projeto.nota) {
    document.getElementById('alunoContent').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">${projeto.titulo}</h2>
                <span class="card-badge ${badgeClass}">${status}</span>
            </div>
            <div class="card-content">
                <div class="info-row">
                    <span class="info-label">Descrição:</span>
                    <span class="info-value">${projeto.descricao}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Orientador:</span>
                    <span class="info-value">${projeto.professores?.Orientadores?.nome || 'Aguardando'}</span>
                </div>
                ${projeto.nota ? `
                <div class="info-row">
                    <span class="info-label">Nota:</span>
                    <span class="info-value"><strong>${projeto.nota.toFixed(1)}</strong></span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Colaboradores:</span>
                    <div>
                        ${projeto.alunos?.map(a => `<span class="chip">${a.nome}</span>`).join('') || 'Nenhum'}
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" onclick="addColaboradorToProjeto(${projeto.id})">
                    Adicionar Colaborador
                </button>
            </div>
        </div>
    `;
    } else {
    document.getElementById('alunoContent').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">${projeto.titulo}</h2>
                <span class="card-badge ${badgeClass}">${status}</span>
            </div>
            <div class="card-content">
                <div class="info-row">
                    <span class="info-label">Descrição:</span>
                    <span class="info-value">${projeto.descricao}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Orientador:</span>
                    <span class="info-value">${projeto.professores?.Orientadores?.nome || 'Aguardando'}</span>
                </div>
                ${projeto.nota ? `
                <div class="info-row">
                    <span class="info-label">Nota:</span>
                    <span class="info-value"><strong>${projeto.nota.toFixed(1)}</strong></span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Colaboradores:</span>
                    <div>
                        ${projeto.alunos?.map(a => `<span class="chip">${a.nome}</span>`).join('') || 'Nenhum'}
                    </div>
                </div>
            </div>
        </div>
    `;
    }
}

function addColaboradorToProjeto(projetoId) {
    currentProjetoId = projetoId;
    openModal('modalAddColaborador');
}

// Modal handlers
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
document.getElementById('formCriarProjeto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matriculas = [currentUser.usuario.matricula];
    console.log(matriculas)
    const colaboradores = document.getElementById('projetoColaboradores').value;
    if (colaboradores) {
        colaboradores.split(',').forEach(m => {
            const mat = parseInt(m.trim());
            if (mat) matriculas.push(mat);
        });
    }

    const dados = {
        titulo: document.getElementById('projetoTitulo').value,
        descricao: document.getElementById('projetoDescricao').value,
        matriculas: matriculas,
        nota: null,
        aprovado: false
    };

    const orientadorReg = document.getElementById('projetoOrientador').value;
    if (orientadorReg) {
        dados.professores = {"Orientadores": parseInt(orientadorReg)}
    }

    try {
        console.log("teste")
        const response = await fetch(`${API_URL}/projetos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            closeModal('modalCriarProjeto');
            showAlert('alunoAlert', 'Projeto criado com sucesso!', 'success');
            loadAlunoData();
            document.getElementById('formCriarProjeto').reset();
        } else {
            const error = await response.json();
            // console.log(error)
            showAlert('alunoAlert', error.erro || 'Erro ao criar projeto', 'error');
        }
    } catch (error) {
        showAlert('alunoAlert', 'Erro ao criar projeto', 'error');
    }
});

document.getElementById('formAddColaborador').addEventListener('submit', async (e) => {
    e.preventDefault();
    const matricula = document.getElementById('colaboradorMatricula').value;

    try {
        const response = await fetch(
            `${API_URL}/projetos/${currentProjetoId}/alunos/${matricula}`,
            { method: 'POST' }
        );

        if (response.ok) {
            closeModal('modalAddColaborador');
            showAlert('alunoAlert', 'Colaborador adicionado com sucesso!', 'success');
            loadAlunoData();
            document.getElementById('formAddColaborador').reset();
        } else {
            const error = await response.json();
            showAlert('alunoAlert', error.erro || 'Erro ao adicionar colaborador', 'error');
        }
    } catch (error) {
        showAlert('alunoAlert', 'Erro ao adicionar colaborador', 'error');
    }
});
});
// Funções do Professor
async function loadProfessorData() {
    document.getElementById('professorNome').textContent = currentUser.usuario.nome;
    showProfessorTab(currentTab);
}

async function showProfessorTab(tab) {
    currentTab = tab;
    document.querySelectorAll('#professorScreen .tab').forEach(t => t.classList.remove('active'));
    event?.target?.classList.add('active');

    if (tab === 'orientacoes') {
        await loadProfessorOrientacoes();
    } else if (tab === 'avaliacoes') {
        await loadProfessorAvaliacoes();
    } 
}

async function loadProfessorOrientacoes() {
    try {
        const response = await fetch(`${API_URL}/projetos`);
        const projetos = await response.json();

        // console.log(projetos);
        // Filtrar projetos onde o professor não é orientador
        const projetosOrientados = projetos.filter(p => 
            (p?.professores?.Orientadores?.registro === currentUser?.usuario?.registro)
        );

        if (projetosOrientados.length === 0) {
            document.getElementById('professorContent').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>Nenhuma orientação no momento</h3>
                        <p>Você ainda não orientou nenhum projeto</p>
                    </div>
                `;
            return;
        }

        const html = `
            <div class="content-grid">
                ${projetosOrientados.map(p => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${p.titulo}</h3>
                        </div>
                        <div class="card-content">
                            <p><strong>Alunos:</strong></p>
                            ${p.alunos?.map(a => `<span class="chip">${a.nome}</span>`).join('') || 'Nenhum'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('professorContent').innerHTML = html;
    } catch (error) {
        showAlert('professorAlert', 'Erro ao carregar orientações', 'error');
    }
}

async function loadProfessorAvaliacoes() {
    try {
        const response = await fetch(`${API_URL}/projetos`);
        const projetos = await response.json();

        const projetosParaAvaliar = projetos.filter(p => 
            (p?.professores?.Orientadores?.registro === currentUser?.usuario?.registro) && !p?.nota
        );

        console.log(projetosParaAvaliar);
        if (projetosParaAvaliar.length === 0) {
            document.getElementById('professorContent').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✓</div>
                    <h3>Nenhum projeto para avaliar</h3>
                </div>
            `;
            return;
        }

        const html = `
            <div class="content-grid">
                ${projetosParaAvaliar.map(p => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${p.titulo}</h3>
                            ${p.nota ? `<span class="card-badge badge-approved">Avaliado: ${p.nota.toFixed(1)}</span>` : ''}
                        </div>
                        <div class="card-content">
                            <p><strong>Orientador:</strong> ${p?.professores?.Orientadores?.nome || 'N/A'}</p>
                        </div>
                        <div class="card-footer">
                            ${!p.nota ? `
                                <button class="btn btn-success" onclick="avaliarProjeto(${p.id})">
                                    Avaliar Projeto
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('professorContent').innerHTML = html;
    } catch (error) {
        showAlert('professorAlert', 'Erro ao carregar projetos', 'error');
    }
}

function avaliarProjeto(projetoId) {
    currentProjetoId = projetoId;
    openModal('modalAvaliar');
}

document.addEventListener('DOMContentLoaded', () => {
document.getElementById('formAvaliar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nota = parseFloat(document.getElementById('projetoNota').value);

    try {
        const response = await fetch(
            `${API_URL}/projetos/${currentProjetoId}/nota?nota=${nota}`,
            { method: 'PUT' }
        );

        if (response.ok) {
            closeModal('modalAvaliar');
            showAlert('professorAlert', 'Projeto avaliado com sucesso!', 'success');
            loadProfessorAvaliacoes();
            document.getElementById('formAvaliar').reset();
        } else {
            showAlert('professorAlert', 'Erro ao avaliar projeto', 'error');
        }
    } catch (error) {
        showAlert('professorAlert', 'Erro ao avaliar projeto', 'error');
    }
});
});

// Funções do Administrador
async function loadAdminData() {
    document.getElementById('adminNome').textContent = currentUser.nome;
    showAdminTab(adminCurrentTab);
}

async function showAdminTab(tab) {
    adminCurrentTab = tab;
    document.querySelectorAll('#adminScreen .tab').forEach(t => t.classList.remove('active'));
    event?.target?.classList.add('active');

    if (tab === 'dashboard') {
        await loadAdminDashboard();
    } else if (tab === 'projetos') {
        await loadAdminProjetos();
    } else if (tab === 'alunos') {
        await loadAdminAlunos();
    } else if (tab === 'professores') {
        await loadAdminProfessores();
    }
}

async function loadAdminDashboard() {
    try {
        const [projetos, alunos, professores] = await Promise.all([
            fetch(`${API_URL}/projetos`).then(r => r.json()),
            fetch(`${API_URL}/alunos`).then(r => r.json()),
            fetch(`${API_URL}/professores`).then(r => r.json())
        ]);

        const projetosAprovados = projetos.filter(p => p.nota && p.nota >= 6).length;

        document.getElementById('adminContent').innerHTML = `
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${projetos.length}</div>
                    <div class="stat-label">Total de Projetos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${alunos.length}</div>
                    <div class="stat-label">Total de Alunos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${professores.length}</div>
                    <div class="stat-label">Total de Professores</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${projetosAprovados}</div>
                    <div class="stat-label">Projetos Aprovados</div>
                </div>
            </div>
            <h3 style="margin-bottom: 16px;">Projetos Recentes</h3>
            <div class="content-grid">
                ${projetos.slice(0, 6).map(p => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${p.titulo}</h3>
                            ${p.nota ? 
                                `<span class="card-badge ${p.nota >= 6 ? 'badge-approved' : 'badge-rejected'}">
                                    ${p.nota.toFixed(1)}
                                </span>` : 
                                '<span class="card-badge badge-pending">Pendente</span>'
                            }
                        </div>
                        <div class="card-content">
                            <p><strong>Orientador:</strong> ${p.orientador?.nome || 'N/A'}</p>
                            <p><strong>Alunos:</strong> ${p.alunos?.length || 0}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        showAlert('adminAlert', 'Erro ao carregar dashboard', 'error');
    }
}

async function loadAdminProjetos() {
    try {
        const response = await fetch(`${API_URL}/projetos`);
        const projetos = await response.json();

        document.getElementById('adminContent').innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Orientador</th>
                        <th>Nota</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${projetos.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.titulo}</td>
                            <td>${p.orientador?.nome || 'N/A'}</td>
                            <td>${p.nota ? p.nota.toFixed(1) : '-'}</td>
                            <td>
                                ${p.nota ? 
                                    (p.nota >= 6 ? 
                                        '<span class="chip" style="background: #d1fae5; color: #065f46;">Aprovado</span>' : 
                                        '<span class="chip" style="background: #fee2e2; color: #991b1b;">Reprovado</span>'
                                    ) : 
                                    '<span class="chip" style="background: #fef3c7; color: #92400e;">Pendente</span>'
                                }
                            </td>
                            <td>
                                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" 
                                        onclick="deletarProjeto(${p.id})">
                                    Deletar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showAlert('adminAlert', 'Erro ao carregar projetos', 'error');
    }
}

async function loadAdminAlunos() {
    try {
        const response = await fetch(`${API_URL}/alunos`);
        const alunos = await response.json();

        document.getElementById('adminContent').innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Matrícula</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Possui Projeto</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunos.map(a => `
                        <tr>
                            <td>${a.matricula}</td>
                            <td>${a.nome}</td>
                            <td>${a.email}</td>
                            <td>${a.curso}</td>
                            <td>${a.projeto ? '✓' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showAlert('adminAlert', 'Erro ao carregar alunos', 'error');
    }
}

async function loadAdminProfessores() {
    try {
        const response = await fetch(`${API_URL}/professores`);
        const professores = await response.json();

        document.getElementById('adminContent').innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Registro</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Permissão</th>
                        <th>Especialização</th>
                    </tr>
                </thead>
                <tbody>
                    ${professores.map(p => `
                        <tr>
                            <td>${p.registro}</td>
                            <td>${p.nome}</td>
                            <td>${p.email}</td>
                            <td>
                                <span class="chip">${p.permissao}</span>
                            </td>
                            <td>${p.especializacao || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showAlert('adminAlert', 'Erro ao carregar professores', 'error');
    }
}

async function deletarProjeto(id) {
    if (!confirm('Tem certeza que deseja deletar este projeto?')) return;

    try {
        const response = await fetch(`${API_URL}/projetos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('adminAlert', 'Projeto deletado com sucesso!', 'success');
            loadAdminProjetos();
        } else {
            showAlert('adminAlert', 'Erro ao deletar projeto', 'error');
        }
    } catch (error) {
        showAlert('adminAlert', 'Erro ao deletar projeto', 'error');
    }
}