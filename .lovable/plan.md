As an Elite Art Director and Frontend Developer, I will overhaul the dashboard to achieve a "Premium" aesthetic, focusing on depth, rhythm, and motion.

### 1. Visual Identity & Depth (Glassmorphism & Shadows)
*   **Palette Refinement**: Shift towards a deeper, more sophisticated dark palette with primary accents using more subtle, multi-layered gradients.
*   **Glassmorphism**: Enhance the `WalletSummaryCard`, `SaldoCard`, and other key containers with a refined glass effect (higher blur, thinner borders, and subtle inner glows).
*   **Soft Shadows**: Replace harsh shadows with multi-layered, diffused soft shadows to create natural depth.

### 2. Typography & Layout (Bento Grid & 8pt System)
*   **Typography Engine**: Standardize the typographic hierarchy using a fluid scale. Increase tracking for display titles and optimize line heights for a "magazine" feel.
*   **Bento Grid**: Restructure the desktop and tablet layouts into a more cohesive Bento Grid, grouping related tools and insights with consistent padding (following the 8pt grid).
*   **Whitespace Optimization**: Increase padding within cards and sections to allow the design to "breathe," reducing cognitive load.

### 3. Motion & Micro-interactions
*   **Staggered Entrances**: Implement `framer-motion` staggered animations for all layout components so they flow in naturally upon load.
*   **Natural Transitions**: Use custom `cubic-bezier` curves for all hover and active states (e.g., `[0.23, 1, 0.32, 1]`) to mimic high-end OS interactions (like iOS/macOS).
*   **Feedback**: Add subtle "glow-on-hover" effects to cards using radial gradients that follow the cursor or pulse gently.

### 4. Technical Refinement
*   **Design Tokens**: Consolidate colors and spacing into consistent Tailwind classes.
*   **Pixel Perfection**: Fix minor misalignments in the mobile and desktop views, ensuring borders are sharp and consistent.

### Technical Details
*   **Files**: `src/pages/Index.tsx`, `src/components/dashboard/WalletSummaryCard.tsx`, `src/components/dashboard/BotFinanceTools.tsx`, `src/components/dashboard/DashboardHeader.tsx`.
*   **Libraries**: `framer-motion` for advanced animations, `lucide-react` for iconography.
*   **System**: Tailwind CSS with custom configuration for `glassmorphism` and `shadows`.
