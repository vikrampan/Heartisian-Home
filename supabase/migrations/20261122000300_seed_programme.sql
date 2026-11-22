-- The longer programme, published with dates and fee to be announced, so people can register interest.
-- Written from the programme outline, without any other institution's name or certification claims.

insert into public.workshops (
  slug, status, published_at, title, subtitle, summary, level, format, venue, venue_address, seats, fee_inr, fee_tba,
  outcomes, schedule, provided, safety_note
) values (
  'natural-building-technician-programme',
  'published',
  now(),
  'Natural Building and Sustainable Construction Technician',
  'A 210-hour hands-on programme in earth-based, alternative and resource-efficient construction.',
  'An entry-level vocational programme for people who want to build with earth, stone and lime. Most of the time is spent on practical work: preparing materials, making compressed stabilised earth blocks, building earth and earthbag wall samples, applying natural plasters, working on stone foundations, understanding steel I-beam and Kadapa stone roofing, and bringing these together in a supervised integrated project. Safety, teamwork, site documentation and the basics of running small building work are part of the course.',
  'Entry level · 18 and over',
  '210 hours · about 5 to 6 weeks · classroom, workshop practice and supervised site work',
  'Kanha Shanti Vanam',
  'Kanha Shanti Vanam, Telangana',
  500,
  0,
  true,
  array[
    'Identify basic construction materials and carry out simple soil field tests',
    'Prepare earth mixes and make compressed stabilised earth blocks (CSEB) by an approved procedure',
    'Help build cast-in-place earth and earthbag walls',
    'Prepare and apply natural and stabilised plaster samples',
    'Help with stone masonry and foundation work',
    'Understand alternative roofing components and the order they are built in',
    'Read simple drawings, measurements and material lists',
    'Follow safety, quality and documentation procedures on site'
  ],
  $json$[
    {
      "label": "Modules 1–5",
      "title": "Materials, blocks and walls",
      "sessions": [
        { "title": "1. Introduction, safety, tools and personal development", "content": "Natural building overview; construction vocabulary; tools; measuring; protective equipment; safe handling; workshop housekeeping; campus orientation.", "method": "12 hours · 5 theory, 7 practical" },
        { "title": "2. Soil science and material testing", "content": "Clay, silt, sand and gravel; plasticity; shrinkage; moisture; soil selection; stabilisation and material reuse. Practical: collect and label samples, jar and shrinkage tests, trial mixes.", "method": "18 hours · 6 theory, 12 practical" },
        { "title": "3. CSEB production and construction", "content": "Soil preparation; stabilisers; moisture; presses and moulds; curing; quality control; masonry and bonding. Practical: operate a press, make and cure blocks, build a sample panel.", "method": "28 hours · 6 theory, 22 practical" },
        { "title": "4. Mud concrete and cast-in-place earth walls", "content": "Earth-based mixes; grading; stabilisation; formwork; placing, compacting and curing; defects. Practical: trial mixes, shuttering and a demonstration wall panel.", "method": "25 hours · 6 theory, 19 practical" },
        { "title": "5. Earthbag construction", "content": "Bag selection; filling; tamping; courses; reinforcement; corners and openings; stability; protective plaster. Practical: build a wall sample and apply a protective finish.", "method": "20 hours · 5 theory, 15 practical" }
      ],
      "outputs": ["Labelled soil samples and test records", "CSEB blocks and a sample masonry panel", "Earth and earthbag wall samples"]
    },
    {
      "label": "Modules 6–10",
      "title": "Finishes, foundations, roofs and a house",
      "sessions": [
        { "title": "6. Natural earth plaster and stabilised finishes", "content": "Earth, sand and fibre; lime- and cement-stabilised finishes; substrate preparation; base and finish coats; cracking and maintenance. Practical: apply and compare samples.", "method": "20 hours · 5 theory, 15 practical" },
        { "title": "7. Stone foundations and alternative foundations", "content": "Ground conditions; setting out; dry stone and random rubble; lime mortar; plinths and drainage. Practical: sort stone, set out and build sample foundation sections.", "method": "20 hours · 5 theory, 15 practical" },
        { "title": "8. Steel I-beam and Kadapa stone roofing", "content": "Roof types; steel sections; stone slabs; bearing; lime concrete topping; waterproofing and drainage; comparison with RCC. Practical: a supervised demonstration frame.", "method": "25 hours · 7 theory, 18 practical" },
        { "title": "9. Basic house construction and integrated project", "content": "Reading plans; setting out; foundation to plinth; walls, openings, roof, floor and finishes; drainage and estimation. Practical: build and document coordinated components.", "method": "32 hours · 7 theory, 25 practical" },
        { "title": "10. Employability, enterprise and site documentation", "content": "Teamwork; communication; costing; small enterprise; responsible living. Practical: estimate materials, keep a work diary and present a portfolio.", "method": "10 hours · 3 theory, 7 practical" }
      ],
      "outputs": ["Plaster, foundation and roofing samples", "An integrated project and a learner portfolio"]
    }
  ]$json$::jsonb,
  array[
    'Tools, materials and equipment for every module',
    'Protective equipment (PPE)',
    'First aid and safe storage'
  ],
  'All practical work is supervised, and structural and safety-critical topics are taught with qualified engineering support. The programme builds practical skills within a defined scope: it does not authorise anyone to design, certify or approve structures. Field tests are indicative and do not replace laboratory testing.'
)
on conflict (slug) do nothing;

insert into public.workshop_trainers (workshop_id, trainer_id, sort)
select w.id, t.id, t.sort
from public.workshops w, public.trainers t
where w.slug = 'natural-building-technician-programme'
  and t.slug in ('francois-bouderlique', 'girish-kumar', 'dil')
on conflict do nothing;
