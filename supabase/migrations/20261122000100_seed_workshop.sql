-- The three trainers and the first workshop, from the workshop outline and the trainers' profiles.
-- The workshop starts as a DRAFT: set its dates and fee in the admin, then publish it.

insert into public.trainers (slug, name, title, experience, bio, expertise, sort) values
(
  'francois-bouderlique',
  'Francois Bouderlique',
  'Alternative & Earth-Based Construction',
  '10 years in design and execution',
  'With 10 years of experience in the design and execution of alternative and earth-based construction techniques, Francois Bouderlique brings practical knowledge of sustainable building systems, natural materials, and low-impact construction approaches. His work focuses on exploring, applying, and sharing construction alternatives that combine traditional knowledge, material awareness, practical craftsmanship, and contemporary building requirements.',
  '{}',
  1
),
(
  'girish-kumar',
  'Girish Kumar (Bunty)',
  'Stabilised Earth & Sustainable Construction',
  '',
  'A specialist in stabilised earth construction and sustainable building materials, with practical knowledge of Compressed Stabilised Earth Blocks (CSEB), earth-based construction techniques, and eco-friendly building solutions. Experienced in soil selection, material preparation, block manufacturing, moulding, pressing, curing, and quality control. Focused on promoting alternative construction methods that are economical, durable, environmentally responsible, and suitable for practical building applications.',
  array[
    'Compressed Stabilised Earth Blocks (CSEB)',
    'Soil selection and testing',
    'Earth stabilisation and material preparation',
    'Block manufacturing and pressing techniques',
    'Quality control and curing',
    'Alternative and eco-friendly construction',
    'Sustainable and cost-effective building solutions'
  ],
  2
),
(
  'dil',
  'Dil',
  'Civil Engineer · Technical Designer',
  '12+ years in construction, technical design and sustainable building',
  E'Dil is a Civil Engineer and Technical Designer with over 12 years of experience spanning conventional construction, technical planning, design coordination, and practical site execution. Combining solid engineering principles with hands-on expertise in natural and stabilised earth systems, he specialises in developing durable, practical, and cost-effective load-bearing structures using locally available materials.\n\nHis work integrates traditional building wisdom with contemporary technical design across Compressed Stabilised Earth Blocks (CSEB), mud construction, earthbag systems, natural plasters, stone foundations, and alternative roofing, creating climate-responsive, environmentally responsible built environments.',
  array[
    'Conventional construction & technical design',
    'Sustainable & alternative building systems',
    'Earth-based construction & load-bearing structures',
    'Compressed Stabilised Earth Blocks (CSEB)',
    'Mud & stabilised earth construction',
    'Earthbag construction',
    'Natural & earth-based plastering',
    'Stone foundations & plinths',
    'Alternative roofing systems',
    'Construction planning & site execution',
    'Material selection & building technology'
  ],
  3
)
on conflict (slug) do nothing;

insert into public.workshops (
  slug, status, title, subtitle, summary, level, format, venue, venue_address, seats, fee_inr,
  outcomes, schedule, provided, safety_note
) values (
  'introduction-to-earth-based-building',
  'draft',
  'Introduction to Alternative and Earth-Based Building Techniques',
  'Understand materials, process, application, limitations and safe practice.',
  'A two-day initiation into selected alternative and earth-based construction systems. The workshop introduces materials, basic testing and preparation, construction sequences and practical demonstrations, and the considerations for choosing and applying each technique in sustainable building projects.',
  'Introductory',
  '2 days · Demonstrations and supervised hands-on practice',
  'Kanha Shanti Vanam',
  'Kanha Shanti Vanam, Telangana',
  500,
  0,
  array[
    'Recognise the principal alternative and earth-based construction techniques covered',
    'Understand basic soil constituents and the importance of testing and documenting material sources',
    'Identify the materials, tools and key steps involved in selected construction systems',
    'Take part in simple supervised practical activities and demonstrations',
    'Discuss the advantages, limitations, quality considerations and appropriate use of different techniques'
  ],
  $json$[
    {
      "title": "Earth, materials & wall systems",
      "sessions": [
        { "title": "Opening & orientation", "content": "Workshop purpose; an overview of alternative building; expectations; an introduction to tools, PPE and workshop safety.", "method": "Discussion; safety briefing" },
        { "title": "Earth as a building material", "content": "Clay, silt, sand and gravel; texture, cohesion, plasticity, moisture and shrinkage; soil sourcing and reuse.", "method": "Samples; visual and tactile observation" },
        { "title": "Basic soil testing", "content": "Sample labelling; visual and tactile identification; the jar (sedimentation) test; simple plasticity and shrinkage demonstrations; the limitations of field tests.", "method": "Small-group tests; observation sheet" },
        { "title": "CSEB introduction", "content": "Soil preparation and grading; the stabiliser concept; moisture control; press and mould; block dimensions; curing, storage and quality checks; masonry bonding.", "method": "Trainer demonstration; sample blocks; process walk-through" },
        { "title": "Practical: CSEB", "content": "Prepare and sieve sample soil; review a trainer-approved batch sheet; observe or produce blocks under supervision; label samples and note visible defects.", "method": "Hands-on activity; production record" },
        { "title": "Cast-in-place earth / mud concrete", "content": "Terminology and distinctions; materials and grading; stabilisation; formwork; placement, compaction, curing and defects.", "method": "Sample panel and formwork demonstration; discussion" },
        { "title": "Day 1 review", "content": "Compare the techniques introduced; reflections; questions; clean-up and tool inventory.", "method": "Review checklist; group feedback" }
      ],
      "outputs": [
        "A labelled soil sample and a simple test record",
        "Observation of, or participation in, a CSEB block production demonstration",
        "A sample or visual record of cast-in-place earth and formwork principles"
      ]
    },
    {
      "title": "Alternative systems & applications",
      "sessions": [
        { "title": "Earthbag construction", "content": "Bag types and condition; fill suitability; controlled filling; placement; tamping; alignment; corners and junctions; reinforcement concepts; openings; moisture protection.", "method": "Material comparison; supervised wall sample" },
        { "title": "Natural earth plaster", "content": "Substrate preparation; earth, sand and fibre; base and finish coats; stabilised finish concepts; application; curing; cracking, debonding, powdering and maintenance.", "method": "Prepare and apply a sample plaster panel" },
        { "title": "Stone & alternative foundations", "content": "Stone selection by size, shape and soundness; dry stone and random rubble; mortar concepts; setting out; plinth, damp protection and drainage.", "method": "Sort stone; construct or inspect a sample" },
        { "title": "Alternative roofing concepts", "content": "Roof components; the steel I-beam and Kadapa stone roofing concept; bearing, joints, lifting, edge protection, waterproofing and drainage; comparison with RCC.", "method": "Component identification; sequence demonstration" },
        { "title": "Technique comparison", "content": "Compare the systems by material availability, labour, tools, process, performance, maintenance, limitations and context.", "method": "Group comparison matrix" },
        { "title": "Integrated practical / group task", "content": "In groups, prepare a simple demonstration or mock-up using selected techniques; identify the steps and materials, and explain the key precautions and limitations.", "method": "Hands-on task; short presentation" },
        { "title": "Closing & reflection", "content": "Review the learning; questions; possible applications; feedback and documentation.", "method": "Learning reflection; feedback" }
      ],
      "outputs": [
        "A supervised earthbag sample or wall-section demonstration",
        "An earth plaster sample panel",
        "A stone sorting and sample masonry or foundation exercise",
        "A group technique comparison and presentation"
      ]
    }
  ]$json$::jsonb,
  array[
    'Tools and materials for every exercise',
    'Protective equipment (PPE)',
    'First aid, handwashing and dust control'
  ],
  'All activities are introductory and supervised. Dust is controlled, hands stay clear of press mechanisms, eye and skin protection is used with lime and cement, stone lifting is managed, and exclusion zones are kept around lifting, formwork and work at height. Structural dimensions, foundation details, mix specifications, beam sizes, roof spans and slab thicknesses are not improvised in this workshop, and field tests are indicative only: they do not replace laboratory testing.'
)
on conflict (slug) do nothing;

insert into public.workshop_trainers (workshop_id, trainer_id, sort)
select w.id, t.id, t.sort
from public.workshops w, public.trainers t
where w.slug = 'introduction-to-earth-based-building'
  and t.slug in ('francois-bouderlique', 'girish-kumar', 'dil')
on conflict do nothing;
