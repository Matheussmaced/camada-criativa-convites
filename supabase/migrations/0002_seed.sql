-- Dados iniciais (podem ser editados depois pelo painel)

insert into public.settings (id) values (1) on conflict (id) do nothing;

insert into public.formats (id, name, short, price, old_price, file, description, tag, sort) values
  ('video', 'Convite Animado em Vídeo', 'Vídeo animado', 79, null, 'MP4 em HD · 30 a 45 segundos', 'Animação com música de fundo e espaço para foto do homenageado.', 'Mais pedido', 1),
  ('imagem', 'Convite Digital em Imagem', 'Imagem', 39, 45, 'PNG em alta resolução', 'Arte estática pronta para enviar no WhatsApp ou imprimir.', 'Melhor preço', 2),
  ('interativo', 'Convite Interativo em PDF', 'Interativo', 59, null, 'PDF com botões clicáveis', 'Botões para confirmar presença, abrir o mapa e ver a lista de presentes.', 'Mais completo', 3)
on conflict (id) do nothing;

insert into public.extras (id, name, description, price, sort) values
  ('save-the-date', 'Save the Date', 'Aviso antecipado para reservarem a data.', 25, 1),
  ('lembrete', 'Lembrete', 'Para enviar na véspera da festa.', 20, 2),
  ('tag', 'Tag Redonda', 'Arte para lembrancinhas, 8 por folha A4.', 20, 3)
on conflict (id) do nothing;

insert into public.products (slug, name, theme, event, motif, palette, badge, rating, reviews, sold, sample_name, sample_age, sample_event_line, description, sort) values
  ('noite-estrelada', 'Convite Noite Estrelada', 'Céu e Estrelas', 'Aniversário', 'stars', '{"bg":"#E6E4FB","soft":"#F5F4FF","accent":"#8B7FD6","ink":"#3D3654"}', 'Destaque', 4.9, 128, 640, 'Theo', 4, 'Aniversário de', 'Um céu lilás cheio de estrelas e uma lua sorridente para festas cheias de sonhos. O tema combina com festas do pijama, aniversários de bebê e qualquer celebração delicada.', 1),
  ('nuvens-de-algodao', 'Convite Nuvens de Algodão', 'Nuvens', 'Chá de Bebê', 'clouds', '{"bg":"#DCEEFB","soft":"#F2F9FF","accent":"#6FA8D8","ink":"#33465C"}', 'Novo', 5, 42, 180, 'Helena', null, 'Chá de bebê da', 'Nuvens fofinhas em azul-bebê para receber quem está chegando. Leve e neutro, funciona para menino ou menina.', 2),
  ('jardim-de-flores', 'Convite Jardim de Flores', 'Jardim', 'Aniversário', 'flowers', '{"bg":"#FFE4DA","soft":"#FFF5F0","accent":"#E8917A","ink":"#5A3B36"}', 'Destaque', 4.9, 96, 510, 'Alice', 1, 'Aniversário da', 'Florzinhas em tons de pêssego para um aniversário delicado ao ar livre. Perfeito para primeiro aninho e festas no jardim.', 3),
  ('baloes-coloridos', 'Convite Balões em Festa', 'Balões', 'Aniversário', 'balloons', '{"bg":"#FFF1D6","soft":"#FFFAEF","accent":"#E9A84F","ink":"#5B4630"}', null, 4.8, 71, 390, 'Miguel', 6, 'Aniversário do', 'Balões subindo em tons de mel e creme. Alegre sem ser exagerado, ideal para qualquer idade.', 4),
  ('fundo-do-mar', 'Convite Fundo do Mar', 'Fundo do Mar', 'Aniversário', 'waves', '{"bg":"#D7F1EE","soft":"#F0FBF9","accent":"#4FB3A6","ink":"#24524C"}', 'Novo', 5, 33, 140, 'Davi', 3, 'Aniversário do', 'Ondas em verde-água e bolhinhas flutuando. Um mergulho tranquilo para festas na piscina ou com tema marinho.', 5),
  ('arco-iris-pastel', 'Convite Arco-íris Pastel', 'Arco-íris', 'Aniversário', 'rainbow', '{"bg":"#FBEFF7","soft":"#FFF8FC","accent":"#C98BB9","ink":"#4E3550"}', null, 4.9, 88, 470, 'Laura', 2, 'Aniversário da', 'Um arco-íris em tons suaves com nuvens. Encanta tanto crianças quanto adultos.', 6),
  ('coracoes-revelacao', 'Convite Revelação de Corações', 'Corações', 'Chá Revelação', 'hearts', '{"bg":"#F7E6F0","soft":"#FDF5FA","accent":"#9C8FE0","ink":"#463B5C"}', 'Destaque', 5, 57, 260, 'Bebê Souza', null, 'Chá revelação do', 'Corações em rosa e lilás que deixam o suspense no ar. Menino ou menina? Seus convidados vão contar os dias.', 7),
  ('confete-15-anos', 'Convite Confete Lilás', 'Confete', '15 Anos', 'confetti', '{"bg":"#ECE6FA","soft":"#F8F5FF","accent":"#7C6BC4","ink":"#352E4D"}', null, 4.8, 24, 95, 'Manuela', 15, 'Os 15 anos de', 'Confetes delicados em lilás e lavanda para uma festa de 15 anos moderna e elegante.', 8),
  ('batizado-nuvem-de-paz', 'Convite Batizado Nuvem de Paz', 'Nuvens', 'Batizado', 'clouds', '{"bg":"#EEF1F6","soft":"#F9FAFC","accent":"#8FA6C8","ink":"#36425A"}', null, 5, 19, 88, 'Lucas', null, 'Batizado do', 'Tons de azul acinzentado e nuvens serenas para um batizado tranquilo e cheio de fé.', 9)
on conflict (slug) do nothing;
