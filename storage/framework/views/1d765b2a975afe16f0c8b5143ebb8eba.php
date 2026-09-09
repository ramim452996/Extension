<?php
if (!function_exists('_1d765b2a975afe16f0c8b5143ebb8eba')):
function _1d765b2a975afe16f0c8b5143ebb8eba($__blaze, $__data = [], $__slots = [], $__bound = [], $__keys = [], $__this = null) {
$__env = $__blaze->env;
$__slots['slot'] ??= new \Illuminate\View\ComponentSlot('');
if (($__data['attributes'] ?? null) instanceof \Illuminate\View\ComponentAttributeBag) { $__data = $__data + $__data['attributes']->all(); unset($__data['attributes']); }
extract($__slots, EXTR_SKIP); unset($__slots);
extract($__data, EXTR_SKIP);
$attributes = \Livewire\Blaze\Runtime\BlazeAttributeBag::make($__data, $__bound, $__keys);
unset($__data, $__bound, $__keys);
ob_start();
?>


<?php
$__defaults = [
    'kbd' => null,
];
$kbd ??= $attributes['kbd'] ?? $__defaults['kbd']; unset($attributes['kbd']);
unset($__defaults);
?>

<?php
$classes = Flux::classes([
    'relative py-2 px-2.5',
    'rounded-md',
    'text-xs text-white font-medium',
    'bg-zinc-800 dark:bg-zinc-700 dark:border dark:border-white/10',
    'p-0 overflow-visible',
]);
?>

<div popover="manual" <?php echo e($attributes->class($classes)); ?> data-flux-tooltip-content>
    <?php echo e($slot); ?>


    <?php if ($kbd): ?>
        <span class="ps-1 text-zinc-300"><?php echo e($kbd); ?></span>
    <?php endif; ?>
</div>
<?php
echo ltrim(ob_get_clean());
} endif; ?><?php /**PATH C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/tooltip/content.blade.php ENDPATH**/ ?>