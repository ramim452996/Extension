<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames(([
    'sidebar' => false,
]));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter(([
    'sidebar' => false,
]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($sidebar): ?>
    <?php if (!function_exists('_bfc17b811ecdb952bc7547ddfdc658d3')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/sidebar/brand.blade.php', $__blaze->compiledPath.'/bfc17b811ecdb952bc7547ddfdc658d3.php'); require $__blaze->compiledPath.'/bfc17b811ecdb952bc7547ddfdc658d3.php'; } ?>
<?php if (isset($__slotsbfc17b811ecdb952bc7547ddfdc658d3)) { $__slotsStackbfc17b811ecdb952bc7547ddfdc658d3[] = $__slotsbfc17b811ecdb952bc7547ddfdc658d3; } ?>
<?php if (isset($__attrsbfc17b811ecdb952bc7547ddfdc658d3)) { $__attrsStackbfc17b811ecdb952bc7547ddfdc658d3[] = $__attrsbfc17b811ecdb952bc7547ddfdc658d3; } ?>
<?php $__attrsbfc17b811ecdb952bc7547ddfdc658d3 = ['name' => config('app.name', 'Laravel'),'attributes' => $attributes]; ?>
<?php $__slotsbfc17b811ecdb952bc7547ddfdc658d3 = []; ?>
<?php $__blaze->pushData($__attrsbfc17b811ecdb952bc7547ddfdc658d3); ?>
<?php ob_start(); ?>
         <?php ob_start(); ?>
            <?php if (isset($component)) { $__componentOriginal159d6670770cb479b1921cea6416c26c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal159d6670770cb479b1921cea6416c26c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.app-logo-icon','data' => ['class' => 'size-5 fill-current text-white dark:text-black']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-logo-icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'size-5 fill-current text-white dark:text-black']); ?>
<?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::processComponentKey($component); ?>

<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal159d6670770cb479b1921cea6416c26c)): ?>
<?php $attributes = $__attributesOriginal159d6670770cb479b1921cea6416c26c; ?>
<?php unset($__attributesOriginal159d6670770cb479b1921cea6416c26c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal159d6670770cb479b1921cea6416c26c)): ?>
<?php $component = $__componentOriginal159d6670770cb479b1921cea6416c26c; ?>
<?php unset($__componentOriginal159d6670770cb479b1921cea6416c26c); ?>
<?php endif; ?>
        <?php $__slotsbfc17b811ecdb952bc7547ddfdc658d3['logo'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), ['class' => 'flex aspect-square size-8 items-center justify-center rounded-md bg-accent-content text-accent-foreground']); ?>
    <?php $__slotsbfc17b811ecdb952bc7547ddfdc658d3['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slotsbfc17b811ecdb952bc7547ddfdc658d3); ?>
<?php _bfc17b811ecdb952bc7547ddfdc658d3($__blaze, $__attrsbfc17b811ecdb952bc7547ddfdc658d3, $__slotsbfc17b811ecdb952bc7547ddfdc658d3, ['name', 'attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStackbfc17b811ecdb952bc7547ddfdc658d3)) { $__slotsbfc17b811ecdb952bc7547ddfdc658d3 = array_pop($__slotsStackbfc17b811ecdb952bc7547ddfdc658d3); } ?>
<?php if (! empty($__attrsStackbfc17b811ecdb952bc7547ddfdc658d3)) { $__attrsbfc17b811ecdb952bc7547ddfdc658d3 = array_pop($__attrsStackbfc17b811ecdb952bc7547ddfdc658d3); } ?>
<?php $__blaze->popData(); ?>
<?php else: ?>
    <?php if (!function_exists('_07905d077240219e36bb89771282076a')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/brand.blade.php', $__blaze->compiledPath.'/07905d077240219e36bb89771282076a.php'); require $__blaze->compiledPath.'/07905d077240219e36bb89771282076a.php'; } ?>
<?php if (isset($__slots07905d077240219e36bb89771282076a)) { $__slotsStack07905d077240219e36bb89771282076a[] = $__slots07905d077240219e36bb89771282076a; } ?>
<?php if (isset($__attrs07905d077240219e36bb89771282076a)) { $__attrsStack07905d077240219e36bb89771282076a[] = $__attrs07905d077240219e36bb89771282076a; } ?>
<?php $__attrs07905d077240219e36bb89771282076a = ['name' => config('app.name', 'Laravel'),'attributes' => $attributes]; ?>
<?php $__slots07905d077240219e36bb89771282076a = []; ?>
<?php $__blaze->pushData($__attrs07905d077240219e36bb89771282076a); ?>
<?php ob_start(); ?>
         <?php ob_start(); ?>
            <?php if (isset($component)) { $__componentOriginal159d6670770cb479b1921cea6416c26c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal159d6670770cb479b1921cea6416c26c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.app-logo-icon','data' => ['class' => 'size-5 fill-current text-white dark:text-black']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-logo-icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'size-5 fill-current text-white dark:text-black']); ?>
<?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::processComponentKey($component); ?>

<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal159d6670770cb479b1921cea6416c26c)): ?>
<?php $attributes = $__attributesOriginal159d6670770cb479b1921cea6416c26c; ?>
<?php unset($__attributesOriginal159d6670770cb479b1921cea6416c26c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal159d6670770cb479b1921cea6416c26c)): ?>
<?php $component = $__componentOriginal159d6670770cb479b1921cea6416c26c; ?>
<?php unset($__componentOriginal159d6670770cb479b1921cea6416c26c); ?>
<?php endif; ?>
        <?php $__slots07905d077240219e36bb89771282076a['logo'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), ['class' => 'flex aspect-square size-8 items-center justify-center rounded-md bg-accent-content text-accent-foreground']); ?>
    <?php $__slots07905d077240219e36bb89771282076a['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots07905d077240219e36bb89771282076a); ?>
<?php _07905d077240219e36bb89771282076a($__blaze, $__attrs07905d077240219e36bb89771282076a, $__slots07905d077240219e36bb89771282076a, ['name', 'attributes'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack07905d077240219e36bb89771282076a)) { $__slots07905d077240219e36bb89771282076a = array_pop($__slotsStack07905d077240219e36bb89771282076a); } ?>
<?php if (! empty($__attrsStack07905d077240219e36bb89771282076a)) { $__attrs07905d077240219e36bb89771282076a = array_pop($__attrsStack07905d077240219e36bb89771282076a); } ?>
<?php $__blaze->popData(); ?>
<?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
<?php /**PATH C:\Users\RAMIM\Herd\compare-backend\resources\views/components/app-logo.blade.php ENDPATH**/ ?>