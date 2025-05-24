-- Add placeholder fork product
INSERT INTO parts (
    name,
    slug,
    price,
    category,
    brand,
    description,
    sku
) VALUES (
    'Universal Fork Set - 48"',
    'universal-fork-set-48',
    1299.99,
    'forks',
    'Universal',
    'Heavy-duty 48" universal fork set for material handling equipment. Features reinforced tines and durable construction for maximum load capacity.',
    'FORK-48-UNI-001'
);

-- Verify the insertion
SELECT * FROM parts WHERE category = 'forks'; 