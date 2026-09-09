<?php
if (!function_exists('_a1906b3ce264b214f96aa322a9c46b47')):
function _a1906b3ce264b214f96aa322a9c46b47($__blaze, $__data = [], $__slots = [], $__bound = [], $__keys = [], $__this = null) {
$__env = $__blaze->env;

if (($__data['attributes'] ?? null) instanceof \Illuminate\View\ComponentAttributeBag) { $__data = $__data + $__data['attributes']->all(); unset($__data['attributes']); }
extract($__slots, EXTR_SKIP); unset($__slots);
extract($__data, EXTR_SKIP);
$attributes = \Livewire\Blaze\Runtime\BlazeAttributeBag::make($__data, $__bound, $__keys);
unset($__data, $__bound, $__keys);
ob_start();
?>


<?php
$__defaults = [
    'iconVariant' => 'mini',
    'size' => null,
];
$iconVariant ??= $attributes['icon-variant'] ?? $attributes['iconVariant'] ?? $__defaults['iconVariant']; unset($attributes['iconVariant'], $attributes['icon-variant']);
$size ??= $attributes['size'] ?? $__defaults['size']; unset($attributes['size']);
unset($__defaults);
?>

<?php
$attributes = $attributes->merge([
    'variant' => 'subtle',
    'class' => '-me-1',
    'square' => true,
    'size' => null,
]);
?>

<?php if (!function_exists('_35dfc6ab30dd743fc2b8403dbd87d765')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/button/index.blade.php', $__blaze->compiledPath.'/35dfc6ab30dd743fc2b8403dbd87d765.php'); require $__blaze->compiledPath.'/35dfc6ab30dd743fc2b8403dbd87d765.php'; } ?>
<?php if (isset($__slots35dfc6ab30dd743fc2b8403dbd87d765)) { $__slotsStack35dfc6ab30dd743fc2b8403dbd87d765[] = $__slots35dfc6ab30dd743fc2b8403dbd87d765; } ?>
<?php if (isset($__attrs35dfc6ab30dd743fc2b8403dbd87d765)) { $__attrsStack35dfc6ab30dd743fc2b8403dbd87d765[] = $__attrs35dfc6ab30dd743fc2b8403dbd87d765; } ?>
<?php $__attrs35dfc6ab30dd743fc2b8403dbd87d765 = ['attributes' => $attributes,'size' => $size === 'sm' || $size === 'xs' ? 'xs' : 'sm','xData' => 'fluxInputViewable','xOn:click' => 'toggle()','xBind:dataViewableOpen' => 'open','ariaLabel' => e(__('Toggle password visibility'))]; ?>
<?php $__slots35dfc6ab30dd743fc2b8403dbd87d765 = []; ?>
<?php $__blaze->pushData($__attrs35dfc6ab30dd743fc2b8403dbd87d765); ?>
<?php ob_start(); ?>
    <?php if (!function_exists('_5a392c61b593a15b8e109e5463813096')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/icon/eye-slash.blade.php', $__blaze->compiledPath.'/5a392c61b593a15b8e109e5463813096.php'); require $__blaze->compiledPath.'/5a392c61b593a15b8e109e5463813096.php'; } ?>
<?php $__blaze->pushData(['variant' => $iconVariant,'class' => 'hidden [[data-viewable-open]>&]:block']); ?>
<?php _5a392c61b593a15b8e109e5463813096($__blaze, ['variant' => $iconVariant,'class' => 'hidden [[data-viewable-open]>&]:block'], [], ['variant'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php $__blaze->popData(); ?>
    <?php if (!function_exists('_21bc0f8a18eeb3e532c8c52f094fd152')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/icon/eye.blade.php', $__blaze->compiledPath.'/21bc0f8a18eeb3e532c8c52f094fd152.php'); require $__blaze->compiledPath.'/21bc0f8a18eeb3e532c8c52f094fd152.php'; } ?>
<?php $__blaze->pushData(['variant' => $iconVariant,'class' => 'block [[data-viewable-open]>&]:hidden']); ?>
<?php _21bc0f8a18eeb3e532c8c52f094fd152($__blaze, ['variant' => $iconVariant,'class' => 'block [[data-viewable-open]>&]:hidden'], [], ['variant'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php $__blaze->popData(); ?>
<?php $__slots35dfc6ab30dd743fc2b8403dbd87d765['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots35dfc6ab30dd743fc2b8403dbd87d765); ?>
<?php _35dfc6ab30dd743fc2b8403dbd87d765($__blaze, $__attrs35dfc6ab30dd743fc2b8403dbd87d765, $__slots35dfc6ab30dd743fc2b8403dbd87d765, ['attributes', 'size'], ['xData' => 'x-data', 'xOn:click' => 'x-on:click', 'xBind:dataViewableOpen' => 'x-bind:data-viewable-open', 'ariaLabel' => 'aria-label'], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack35dfc6ab30dd743fc2b8403dbd87d765)) { $__slots35dfc6ab30dd743fc2b8403dbd87d765 = array_pop($__slotsStack35dfc6ab30dd743fc2b8403dbd87d765); } ?>
<?php if (! empty($__attrsStack35dfc6ab30dd743fc2b8403dbd87d765)) { $__attrs35dfc6ab30dd743fc2b8403dbd87d765 = array_pop($__attrsStack35dfc6ab30dd743fc2b8403dbd87d765); } ?>
<?php $__blaze->popData(); ?>
<?php
echo ltrim(ob_get_clean());
} endif; ?><?php /**PATH C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/input/viewable.blade.php ENDPATH**/ ?>