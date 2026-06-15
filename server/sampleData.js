const now = Date.now();

const sampleAuthors = [
  { id: 'sample-ana', name: 'Ana Rivera', username: 'paintwithana', avatarUrl: '' },
  { id: 'sample-miles', name: 'Miles Chen', username: 'balconymiles', avatarUrl: '' },
  { id: 'sample-zoe', name: 'Zoe Walker', username: 'makerzoe', avatarUrl: '' },
  { id: 'sample-dev', name: 'Dev Patel', username: 'lensdev', avatarUrl: '' },
  { id: 'sample-nina', name: 'Nina Brooks', username: 'ninabakes', avatarUrl: '' },
  { id: 'sample-omar', name: 'Omar Santos', username: 'omarbeats', avatarUrl: '' },
  { id: 'sample-jules', name: 'Jules Kim', username: 'julesmoves', avatarUrl: '' },
  { id: 'sample-rhea', name: 'Rhea Singh', username: 'rheagames', avatarUrl: '' },
];

export const sampleUsers = sampleAuthors.map((author, index) => ({
  ...author,
  passwordHash: '',
  joinedAt: now - (index + 8) * 86400000,
}));

export const samplePosts = [
  {
    id: 'sample-20',
    title: 'Sunday sourdough notes from my tiny kitchen',
    content:
      "I finally got a loaf with the kind of blistered crust I kept seeing in photos. The biggest change was patience: a longer bulk ferment, a gentle coil fold, and preheating the Dutch oven until I stopped doubting the timer.\n\nNext experiment is adding roasted garlic and rosemary. What mix-ins have worked well for you?",
    category: 'Food',
    imageUrl:
      'https://loremflickr.com/900/620/sourdough,bread?lock=20020',
    createdAt: now - 220000,
    author: sampleAuthors[4],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6', 'seed-7'],
    comments: [
      {
        id: 'sample-comment-2001',
        text: 'Roasted garlic is great. I also like folding in olives after the first rest.',
        createdAt: now - 180000,
        author: sampleAuthors[1],
      },
    ],
  },
  {
    id: 'sample-19',
    title: 'Learning guitar with ten focused minutes a day',
    content:
      "I used to wait for a perfect one-hour practice window and then skip practice entirely. Ten minutes has been the unlock: tune, warm up, play one chord change slowly, then end with a song I actually like.\n\nThe progress feels tiny day to day, but my fingers are finally doing what my brain asks.",
    category: 'Music',
    imageUrl:
      'https://loremflickr.com/900/620/guitar,music?lock=20019',
    createdAt: now - 320000,
    author: sampleAuthors[5],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-1901',
        text: 'This is exactly how I got past the F chord. Small sessions add up.',
        createdAt: now - 260000,
        author: sampleAuthors[6],
      },
      {
        id: 'sample-comment-1902',
        text: 'Ending with a fun song is such a good motivation trick.',
        createdAt: now - 240000,
        author: sampleAuthors[0],
      },
    ],
  },
  {
    id: 'sample-18',
    title: 'My cozy strategy game night setup',
    content:
      "A few friends and I started a weekly strategy game night. We rotate between deck builders, city builders, and one very dramatic civilization campaign that somehow turns every trade agreement into theater.\n\nThe best part has been keeping a shared notes doc with house rules, grudges, and snack rankings.",
    category: 'Gaming',
    imageUrl:
      'https://loremflickr.com/900/620/boardgame,gaming?lock=20018',
    createdAt: now - 420000,
    author: sampleAuthors[7],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'],
    comments: [
      {
        id: 'sample-comment-1801',
        text: 'Snack rankings as official records is elite community management.',
        createdAt: now - 360000,
        author: sampleAuthors[5],
      },
    ],
  },
  {
    id: 'sample-17',
    title: 'Morning stretch routine that actually stuck',
    content:
      "I stopped trying to build a perfect wellness routine and made a five-move stretch sequence I can do while coffee brews. Neck rolls, hamstring folds, hip openers, shoulder circles, and one slow breathing minute.\n\nIt is not flashy, but my back is much happier by lunch.",
    category: 'Wellness',
    imageUrl:
      'https://loremflickr.com/900/620/yoga,stretching?lock=20017',
    createdAt: now - 520000,
    author: sampleAuthors[6],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6'],
    comments: [
      {
        id: 'sample-comment-1701',
        text: 'Coffee timer routines are undefeated. I do mobility while tea steeps.',
        createdAt: now - 460000,
        author: sampleAuthors[4],
      },
    ],
  },
  {
    id: 'sample-1',
    title: 'Getting started with watercolor painting',
    content:
      "Watercolor painting is a relaxing and rewarding hobby that anyone can learn. I started six months ago and wanted to share what actually helped: quality paper, a basic color set, and permission to make messy first pages.\n\nMy favorite techniques so far are wet-on-wet for dreamy landscapes and dry brush for texture. What techniques are you trying next?",
    category: 'Art',
    imageUrl:
      'https://loremflickr.com/900/620/watercolor,painting?lock=20001',
    createdAt: now - 1000000,
    author: sampleAuthors[0],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'],
    comments: [
      {
        id: 'sample-comment-101',
        text: 'I love watercolors too. Have you tried gouache for brighter layers?',
        createdAt: now - 800000,
        author: sampleAuthors[2],
      },
      {
        id: 'sample-comment-102',
        text: 'This makes it feel less intimidating. Paper quality was the missing piece for me.',
        createdAt: now - 500000,
        author: sampleAuthors[1],
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'My urban gardening adventure',
    content:
      "Living in an apartment does not mean you cannot garden. I transformed my balcony into a tiny herb and vegetable corner with basil, mint, tomatoes, lettuce, and a few very opinionated pepper plants.\n\nNothing tastes better than food you grew yourself, especially when the whole setup fits next to a folding chair.",
    category: 'Outdoors',
    imageUrl:
      'https://loremflickr.com/900/620/balcony,garden?lock=20002',
    createdAt: now - 2000000,
    author: sampleAuthors[1],
    votes: ['seed-1', 'seed-2', 'seed-3'],
    comments: [
      {
        id: 'sample-comment-201',
        text: 'How many hours of sun does your balcony get? Mine is shady after noon.',
        createdAt: now - 1500000,
        author: sampleAuthors[0],
      },
    ],
  },
  {
    id: 'sample-3',
    title: "Beginner's guide to woodworking",
    content:
      "I picked up woodworking during a long winter and it has become a real passion. I started with a cutting board and worked my way up to small furniture.\n\nFor beginners, I recommend learning with hand tools before buying every power tool in sight. Understand wood grain, measure twice, and always prioritize safety.",
    category: 'Making',
    imageUrl:
      'https://loremflickr.com/900/620/woodworking,tools?lock=20003',
    createdAt: now - 3000000,
    author: sampleAuthors[2],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6'],
    comments: [
      {
        id: 'sample-comment-301',
        text: 'What was your first project that felt genuinely useful?',
        createdAt: now - 2500000,
        author: sampleAuthors[3],
      },
      {
        id: 'sample-comment-302',
        text: 'I just completed my first shelf. It is not perfect, but I am proud of it.',
        createdAt: now - 1000000,
        author: sampleAuthors[1],
      },
    ],
  },
  {
    id: 'sample-4',
    title: 'Digital photography tips for hobbyists',
    content:
      "Photography has been my creative outlet for years. You do not need expensive equipment to take great photos. Understanding composition and lighting will take you further than any camera upgrade.\n\nStart with the exposure triangle and practice around the same place at different times of day. Light changes everything.",
    category: 'Photography',
    imageUrl:
      'https://loremflickr.com/900/620/camera,photography?lock=20004',
    createdAt: now - 4000000,
    author: sampleAuthors[3],
    votes: ['seed-1', 'seed-2'],
    comments: [],
  },
  {
    id: 'sample-5',
    title: 'Pressed flower bookmarks from a weekend walk',
    content:
      "I collected a few fallen petals and tiny leaves on a walk, pressed them between book pages, and turned them into laminated bookmarks. It was a simple project, but it made my current reads feel personal.\n\nNext time I want to label each one with the date and place I found the flowers.",
    category: 'Art',
    imageUrl:
      'https://loremflickr.com/900/620/pressed,flowers?lock=20005',
    createdAt: now - 5000000,
    author: sampleAuthors[0],
    votes: ['seed-1', 'seed-2', 'seed-3'],
    comments: [
      {
        id: 'sample-comment-501',
        text: 'Date and place labels would make them feel like tiny field journals.',
        createdAt: now - 4700000,
        author: sampleAuthors[2],
      },
    ],
  },
  {
    id: 'sample-6',
    title: 'Trail snacks that survived a muddy hike',
    content:
      "We tried a new loop after rain and learned which snacks were worth carrying. Dried mango, salted almonds, and peanut butter wraps were perfect. The chocolate bar became a science experiment.\n\nI am building a little checklist for future hikes so packing feels automatic.",
    category: 'Outdoors',
    imageUrl:
      'https://loremflickr.com/900/620/hiking,trail?lock=20006',
    createdAt: now - 6000000,
    author: sampleAuthors[1],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-601',
        text: 'Peanut butter wraps are my default too. They never let me down.',
        createdAt: now - 5500000,
        author: sampleAuthors[3],
      },
    ],
  },
  {
    id: 'sample-7',
    title: 'A tiny mending kit changed my closet',
    content:
      "I put together a little tin with thread, needles, buttons, fabric patches, and a seam ripper. Now small repairs happen while I watch a show instead of becoming a doom pile.\n\nThe first save was a denim jacket with a pocket tear. It looks better with the patch than it did before.",
    category: 'Making',
    imageUrl:
      'https://loremflickr.com/900/620/sewing,mending?lock=20007',
    createdAt: now - 7000000,
    author: sampleAuthors[2],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'],
    comments: [
      {
        id: 'sample-comment-701',
        text: 'Visible mending is so satisfying. A good patch makes the whole piece feel intentional.',
        createdAt: now - 6400000,
        author: sampleAuthors[4],
      },
      {
        id: 'sample-comment-702',
        text: 'I need to make one of these tins before my repair pile wins.',
        createdAt: now - 6100000,
        author: sampleAuthors[0],
      },
    ],
  },
  {
    id: 'sample-8',
    title: 'Golden hour photo walk challenge',
    content:
      "I gave myself one rule: shoot only reflections for thirty minutes. Windows, puddles, bike mirrors, even a shiny mailbox became part of the hunt.\n\nConstraints make photo walks feel fresh. What single-rule challenge should I try next?",
    category: 'Photography',
    imageUrl:
      'https://loremflickr.com/900/620/reflection,photography?lock=20008',
    createdAt: now - 8000000,
    author: sampleAuthors[3],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-801',
        text: 'Try only shadows next. It completely changes how you see a street.',
        createdAt: now - 7600000,
        author: sampleAuthors[7],
      },
    ],
  },
  {
    id: 'sample-9',
    title: 'First attempt at homemade dumplings',
    content:
      "My folds were wildly inconsistent, but dinner still tasted fantastic. I made a ginger scallion filling, froze half the batch, and pan-fried the rest until the bottoms were crisp.\n\nNext goal is learning a pleat that does not look improvised under pressure.",
    category: 'Food',
    imageUrl:
      'https://loremflickr.com/900/620/dumplings,food?lock=20009',
    createdAt: now - 9000000,
    author: sampleAuthors[4],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6'],
    comments: [
      {
        id: 'sample-comment-901',
        text: 'Uneven dumplings taste better because each one has a personality.',
        createdAt: now - 8600000,
        author: sampleAuthors[1],
      },
    ],
  },
  {
    id: 'sample-10',
    title: 'Building a lo-fi beat from kitchen sounds',
    content:
      "I sampled a mug tap, a drawer closing, and the kettle click, then built a small lo-fi loop around them. It made me listen to my apartment differently for the rest of the day.\n\nFound sounds are a fun way to start a track when a blank session feels too blank.",
    category: 'Music',
    imageUrl:
      'https://loremflickr.com/900/620/music,studio?lock=20010',
    createdAt: now - 10000000,
    author: sampleAuthors[5],
    votes: ['seed-1', 'seed-2', 'seed-3'],
    comments: [
      {
        id: 'sample-comment-1001',
        text: 'The kettle click as percussion sounds weirdly perfect.',
        createdAt: now - 9600000,
        author: sampleAuthors[3],
      },
    ],
  },
  {
    id: 'sample-11',
    title: 'Breathing reset between study blocks',
    content:
      "I have been using a two-minute breathing reset between study sessions: inhale for four, hold for two, exhale for six. It keeps me from carrying tension into the next block.\n\nThe biggest benefit is noticing when I am rushing before I burn out.",
    category: 'Wellness',
    imageUrl:
      'https://loremflickr.com/900/620/meditation,breathing?lock=20011',
    createdAt: now - 11000000,
    author: sampleAuthors[6],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-1101',
        text: 'I am borrowing this for work sprints. The longer exhale helps so much.',
        createdAt: now - 10500000,
        author: sampleAuthors[0],
      },
    ],
  },
  {
    id: 'sample-12',
    title: 'Solo RPG journaling surprised me',
    content:
      "I tried a solo journaling RPG and expected it to feel awkward. Instead it became a cozy writing prompt engine. A few dice rolls gave me a character, a village problem, and a reason to write for twenty minutes.\n\nIt sits somewhere between gaming, creative writing, and daydreaming with rules.",
    category: 'Gaming',
    imageUrl:
      'https://loremflickr.com/900/620/dice,journal?lock=20012',
    createdAt: now - 12000000,
    author: sampleAuthors[7],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'],
    comments: [
      {
        id: 'sample-comment-1201',
        text: 'That sounds like the perfect rainy evening hobby.',
        createdAt: now - 11600000,
        author: sampleAuthors[2],
      },
    ],
  },
  {
    id: 'sample-13',
    title: 'Sketchbook page using only three colors',
    content:
      "I limited a whole page to green, coral, and gold. The restriction made composition easier because I stopped hunting for the perfect color and focused on shape.\n\nI might make this a weekly warmup whenever I feel stuck.",
    category: 'Art',
    imageUrl:
      'https://loremflickr.com/900/620/sketchbook,art?lock=20013',
    createdAt: now - 13000000,
    author: sampleAuthors[0],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-1301',
        text: 'Three-color pages are such a good way to quiet the decision noise.',
        createdAt: now - 12400000,
        author: sampleAuthors[6],
      },
    ],
  },
  {
    id: 'sample-14',
    title: 'Balcony birdwatching before breakfast',
    content:
      "I started keeping binoculars by the kitchen window and logging every bird I notice before breakfast. The list is still modest, but paying attention has made the morning feel bigger.\n\nToday I spotted a finch, two crows, and a hummingbird that moved like a tiny deadline.",
    category: 'Outdoors',
    imageUrl:
      'https://loremflickr.com/900/620/bird,birdwatching?lock=20014',
    createdAt: now - 14000000,
    author: sampleAuthors[1],
    votes: ['seed-1', 'seed-2', 'seed-3'],
    comments: [
      {
        id: 'sample-comment-1401',
        text: 'A window bird list sounds peaceful. I might start one this week.',
        createdAt: now - 13400000,
        author: sampleAuthors[5],
      },
    ],
  },
  {
    id: 'sample-15',
    title: 'DIY desk shelf for art supplies',
    content:
      "I built a low desk shelf from scrap plywood to get paints, pens, and tape off the work surface. It is not fancy, but suddenly my desk has breathing room.\n\nThe small win: I measured the tallest marker first, so everything actually fits.",
    category: 'Making',
    imageUrl:
      'https://loremflickr.com/900/620/desk,shelf?lock=20015',
    createdAt: now - 15000000,
    author: sampleAuthors[2],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6'],
    comments: [
      {
        id: 'sample-comment-1501',
        text: 'Measuring around the tallest item is the kind of lesson I always learn late.',
        createdAt: now - 14400000,
        author: sampleAuthors[4],
      },
    ],
  },
  {
    id: 'sample-16',
    title: 'Editing phone photos with a consistent mood',
    content:
      "I made a simple editing recipe for phone photos: lower highlights, warm the temperature slightly, lift shadows, and keep contrast gentle. It makes casual snapshots feel like they belong together.\n\nNow I am building a little album from everyday moments instead of waiting for special occasions.",
    category: 'Photography',
    imageUrl:
      'https://loremflickr.com/900/620/phone,photography?lock=20016',
    createdAt: now - 16000000,
    author: sampleAuthors[3],
    votes: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    comments: [
      {
        id: 'sample-comment-1601',
        text: 'A consistent recipe makes albums feel so much calmer.',
        createdAt: now - 15400000,
        author: sampleAuthors[7],
      },
    ],
  },
];

export const initialData = {
  users: sampleUsers,
  posts: samplePosts,
  friendships: [
    {
      id: 'sample-friend-1',
      userIds: ['sample-ana', 'sample-zoe'],
      requesterId: 'sample-ana',
      recipientId: 'sample-zoe',
      status: 'accepted',
      createdAt: now - 600000,
      acceptedAt: now - 500000,
    },
    {
      id: 'sample-friend-2',
      userIds: ['sample-miles', 'sample-dev'],
      requesterId: 'sample-miles',
      recipientId: 'sample-dev',
      status: 'accepted',
      createdAt: now - 900000,
      acceptedAt: now - 800000,
    },
  ],
  messages: [],
};
